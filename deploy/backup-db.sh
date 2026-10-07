#!/usr/bin/env bash
set -euo pipefail

# Save a compressed PostgreSQL dump locally and retain the seven newest dumps.
cd "$(dirname "$0")/.."
backup_dir="./backups"
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_file="${backup_dir}/agents-${timestamp}.sql.gz"

docker compose -f docker-compose.prod.yml exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | gzip > "$backup_file"

find "$backup_dir" -maxdepth 1 -type f -name 'agents-*.sql.gz' -printf '%T@ %p\n' \
  | sort -nr \
  | tail -n +8 \
  | cut -d' ' -f2- \
  | while IFS= read -r old_backup; do
      [[ -z "$old_backup" ]] || rm -- "$old_backup"
    done

echo "Database backup written to $backup_file"
