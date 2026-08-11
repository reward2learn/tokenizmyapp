#!/usr/bin/env bash
set -e

zenstack generate --schema zenstack/schema.zmodel

# DB sync used during builds. Neon scale-to-zero computes suspend after a few
# minutes of inactivity; the first connection wakes them, which can exceed the
# client's connect timeout. Retry so a cold-start race does not fail the build.
db_sync() {
  echo "ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_email_key;" | \
    npx prisma db execute --stdin --schema=zenstack/prisma/schema.prisma
  npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss
}

if [ -n "$POSTGRES_URL" ]; then
  attempts=3
  for i in $(seq 1 "$attempts"); do
    if db_sync; then
      echo "Database schema in sync."
      break
    fi
    if [ "$i" -lt "$attempts" ]; then
      echo "DB sync attempt $i failed — database compute may be cold-starting. Retrying in 10s..."
      sleep 10
    else
      echo "DB sync failed after $attempts attempts."
      exit 1
    fi
  done
fi

next build
