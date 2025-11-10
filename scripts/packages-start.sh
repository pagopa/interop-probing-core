#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_FILE="$ROOT_DIR/docker/.env.packages"
cd "$ROOT_DIR"

echo "Generating aggregated env file for docker compose (inlined generator)..."

# Service definitions: "service-name:env-file-path:default-port"
SERVICES=(
  "probing-api:packages/probing-api/.env:3010"
  "probing-statistics-api:packages/probing-statistics-api/.env:3011"
  "probing-eservice-operations:packages/probing-eservice-operations/.env:3000"
  "eservice-event-consumer:packages/eservice-event-consumer/.env:3001"
  "tenant-event-consumer:packages/tenant-event-consumer/.env:3002"
  "probing-scheduler:packages/probing-scheduler/.env:3003"
  "probing-caller:packages/probing-caller/.env:3004"
  "probing-response-updater:packages/probing-response-updater/.env:3005"
  "probing-telemetry-writer:packages/probing-telemetry-writer/.env:3006"
)

mkdir -p "$ROOT_DIR/docker"
: > "$OUT_FILE"

for entry in "${SERVICES[@]}"; do
  IFS=: read -r svc envfile defaultport <<< "$entry"
  pkgfile="$ROOT_DIR/$envfile"
  varname="$(echo "$svc" | tr '[:lower:]-' '[:upper:]_')_PORT"
  portvalue=""

  if [ -f "$pkgfile" ]; then
    portvalue=$(grep -E '^PORT=' "$pkgfile" | head -n1 | cut -d'=' -f2- || true)
  fi

  if [ -z "$portvalue" ]; then
    portvalue="$defaultport"
  fi

  echo "$varname=$portvalue" >> "$OUT_FILE"
done

echo "Generated $OUT_FILE"
cat "$OUT_FILE"

echo "Bringing up package services with docker compose..."
docker compose -f docker/docker-compose-packages.yml --env-file docker/.env.packages up --build -d

echo "Done. To view logs: docker compose -f docker/docker-compose-packages.yml logs -f"
