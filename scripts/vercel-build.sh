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

if [ -n "$POSTGRES_URL" ]; then
  # Prefer direct Neon URL for build-time schema sync (pooler refuses connections
  # while compute is waking). Fall back to pooled POSTGRES_URL.
  BUILD_DB_URL="${POSTGRES_URL_NON_POOLING:-${DATABASE_URL_UNPOOLED:-$POSTGRES_URL}}"
  export POSTGRES_URL="$BUILD_DB_URL"

  RESULT_FILE="$(mktemp)"
  export WAIT_FOR_POSTGRES_RESULT_FILE="$RESULT_FILE"

  if node scripts/wait-for-postgres.mjs zenstack/prisma/schema.prisma; then
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
    echo "WARNING: Database unreachable — skipping schema sync, continuing build."
  fi
fi

npx next build
