#!/usr/bin/env bash
set -e
zenstack generate --schema zenstack/schema.zmodel
if [ -n "$POSTGRES_URL" ]; then
  echo "ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_email_key;" | npx prisma db execute --stdin --schema=zenstack/prisma/schema.prisma
  npx prisma db push --schema=zenstack/prisma/schema.prisma --skip-generate --accept-data-loss
fi
next build
