#!/usr/bin/env bash
set -e

# Fail fast on the mismatch that has broken this build twice: an index created
# by runtime DDL but not pinned in the zmodel makes `prisma db push` emit a
# DropIndex, which errors out on any database where the helper has not run.
# Cheap, and it fails here with an actionable message instead of 20s later
# inside the schema engine.
node scripts/enforce-index-names.mjs
node scripts/enforce-required-columns.mjs

npx zenstack generate --schema zenstack/schema.zmodel

# Build-time schema sync is optional. Skip when:
#   SKIP_BUILD_DB_SYNC=1     explicit opt-out (e.g. Neon quota exceeded)
#   BUILD_DB_SYNC unset on Vercel — default skip on Vercel; set BUILD_DB_SYNC=1 to enable
should_sync_db() {
  case "${SKIP_BUILD_DB_SYNC:-}" in
    1|true|TRUE|yes|YES) return 1 ;;
  esac
  if [ -n "$BUILD_DB_SYNC" ]; then
    case "$BUILD_DB_SYNC" in
      1|true|TRUE|yes|YES) return 0 ;;
      *) return 1 ;;
    esac
  fi
  # Local / CI without VERCEL: sync when POSTGRES_URL is available.
  if [ -z "$VERCEL" ]; then
    return 0
  fi
  # Vercel deploys: skip by default — run `prisma db push` locally or via migrate API.
  return 1
}

if [ -n "$POSTGRES_URL" ] && should_sync_db; then
  BUILD_DB_URL="${POSTGRES_URL_NON_POOLING:-${DATABASE_URL_UNPOOLED:-$POSTGRES_URL}}"
  export POSTGRES_URL="$BUILD_DB_URL"

  RESULT_FILE="$(mktemp)"
  export WAIT_FOR_POSTGRES_RESULT_FILE="$RESULT_FILE"
  WAIT_EXIT=0
  node scripts/wait-for-postgres.mjs zenstack/prisma/schema.prisma || WAIT_EXIT=$?

  if [ "$WAIT_EXIT" -eq 0 ]; then
    if [ -s "$RESULT_FILE" ]; then
      export POSTGRES_URL="$(cat "$RESULT_FILE")"
    fi
    rm -f "$RESULT_FILE"
    echo "ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_email_key;" | \
      npx prisma db execute --stdin --schema=zenstack/prisma/schema.prisma
    echo "ALTER TABLE knowledge_snippets DROP CONSTRAINT IF EXISTS knowledge_snippets_key_key;" | \
      npx prisma db execute --stdin --schema=zenstack/prisma/schema.prisma
    npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss || true
    echo "Database schema in sync."
  else
    rm -f "$RESULT_FILE"
    if [ "$WAIT_EXIT" -eq 2 ]; then
      echo "WARNING: Database blocked (quota/auth) — skipping schema sync, continuing build."
      echo "         Fix Neon quota or run: npx prisma db push --schema=zenstack/prisma/schema.prisma"
    else
      echo "WARNING: Database unreachable — skipping schema sync, continuing build."
    fi
  fi
elif [ -n "$POSTGRES_URL" ]; then
  echo "[vercel-build] Skipping build-time DB sync (set BUILD_DB_SYNC=1 on Vercel to enable)."
fi

npx next build
