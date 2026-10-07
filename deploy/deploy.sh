#!/usr/bin/env bash
set -euo pipefail

# Run from the cloned repository root to update and start the production stack.
git pull --ff-only
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --wait
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
docker compose -f docker-compose.prod.yml ps

curl --fail --show-error --silent http://localhost/health
printf '\n'
curl --fail --show-error --silent 'http://localhost/api/agents?limit=1'
printf '\n'
