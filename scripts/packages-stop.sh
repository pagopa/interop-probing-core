#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/docker/.env.packages"
cd "$ROOT_DIR"

echo "Stopping package services..."
docker compose -f docker/docker-compose-packages.yml --env-file "$ENV_FILE" stop

if [ -f "$ENV_FILE" ]; then
	echo "Removing generated env file $ENV_FILE"
	rm -f "$ENV_FILE"
fi

echo "Services stopped and env file cleaned up."
