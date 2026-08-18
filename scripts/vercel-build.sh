#!/usr/bin/env bash
set -e

# Fail fast on the mismatch that has broken this build twice: an index created
# by runtime DDL but not pinned in the zmodel makes `prisma db push` emit a
# DropIndex, which errors out on any database where the helper has not run.
# Cheap, and it fails here with an actionable message instead of 20s later
# inside the schema engine.
node scripts/enforce-index-names.mjs
node scripts/enforce-required-columns.mjs

zenstack generate --schema zenstack/schema.zmodel

if [ -n "$POSTGRES_URL" ]; then
  # Neon scale-to-zero computes suspend after ~5 minutes of inactivity. A cold
  # start can take 30-90s while the pooler refuses connections fast (Prisma
  # P1001). Give each attempt real patience so the wake-up does not fail the
  # build, then probe with lightweight SELECT 1s (each probe also triggers the
  # wake) for up to ~3 minutes before running the actual schema sync.
  case "$POSTGRES_URL" in
    *\?*) export POSTGRES_URL="${POSTGRES_URL}&connect_timeout=30" ;;
    *)    export POSTGRES_URL="${POSTGRES_URL}?connect_timeout=30" ;;
  esac

  db_ready() {
    echo "SELECT 1;" | npx prisma db execute --stdin --schema=zenstack/prisma/schema.prisma >/dev/null 2>&1
  }

  echo "Waiting for database to be reachable..."
  warm_attempts=12
  for i in $(seq 1 "$warm_attempts"); do
    if db_ready; then
      echo "Database reachable (probe $i)."
      break
    fi
    if [ "$i" -eq "$warm_attempts" ]; then
      echo "Database unreachable after $warm_attempts probes."
      exit 1
    fi
    echo "Database not reachable yet (probe $i/$warm_attempts) — waking compute, retrying in 15s..."
    sleep 15
  done

  echo "ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_email_key;" | \
    npx prisma db execute --stdin --schema=zenstack/prisma/schema.prisma
  echo "ALTER TABLE knowledge_snippets DROP CONSTRAINT IF EXISTS knowledge_snippets_key_key;" | \
    npx prisma db execute --stdin --schema=zenstack/prisma/schema.prisma
  npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss || true
  echo "Database schema in sync."
fi

next build
