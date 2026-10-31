#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "Starting SOUQ Production Deploy"
echo "=========================================="

BACKUP_DIR="backups/pre-deploy-$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "[1/5] Executing pre-deploy database backup..."
bash scripts/backup.sh || echo "[Warning] Backup failed or skipped in dev mode"

echo "[2/5] Building and updating Docker services..."
docker compose -f docker/compose.prod.yaml build --pull

echo "[3/5] Starting new application containers (Blue/Green)..."
docker compose -f docker/compose.prod.yaml up -d --no-deps --scale api-1=1 --scale api-2=1 api-1 api-2 worker

echo "[4/5] Executing automated smoke tests..."
if bash scripts/smoke-test.sh; then
  echo "[Deploy] Smoke tests PASSED! Reloading Nginx configuration..."
  docker compose -f docker/compose.prod.yaml exec nginx nginx -s reload || true
  echo "=========================================="
  echo "Deploy Completed Successfully!"
  echo "=========================================="
else
  echo "[Deploy] Smoke tests FAILED! Initiating automatic rollback..."
  bash scripts/rollback.sh
  exit 1
fi
