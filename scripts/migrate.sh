#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

for migration in migrations/*.sql; do
  [ -e "$migration" ] || continue
  echo "Running $migration"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done

echo "Migrations complete"
