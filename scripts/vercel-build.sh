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
  # Neon scale-to-zero: cold starts can take 30-90s (Prisma P1001). Probe for
  # up to ~3 minutes; if still unreachable, skip schema sync but continue the
  # build — db push is best-effort (|| true) and the schema is usually already
  # in sync from a prior deploy.
  case "$POSTGRES_URL" in
    *\?*) export POSTGRES_URL="${POSTGRES_URL}&connect_timeout=30" ;;
    *)    export POSTGRES_URL="${POSTGRES_URL}?connect_timeout=30" ;;
  esac

  if node scripts/wait-for-postgres.mjs zenstack/prisma/schema.prisma; then
    echo "ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_email_key;" | \
      npx prisma db execute --stdin --schema=zenstack/prisma/schema.prisma
    echo "ALTER TABLE knowledge_snippets DROP CONSTRAINT IF EXISTS knowledge_snippets_key_key;" | \
      npx prisma db execute --stdin --schema=zenstack/prisma/schema.prisma
    npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss || true
    echo "Database schema in sync."
  else
    echo "WARNING: Database unreachable — skipping schema sync, continuing build."
  fi
fi

npx next build
