#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/docker/.env.packages"
cd "$ROOT_DIR"

echo "Destroying package services (down + cleanup)..."
docker compose -f docker/docker-compose-packages.yml --env-file "$ENV_FILE" down -v

if [ -f "$ENV_FILE" ]; then
	echo "Removing generated env file $ENV_FILE"
	rm -f "$ENV_FILE"
fi

echo "Destroyed packages and cleaned up generated files."
