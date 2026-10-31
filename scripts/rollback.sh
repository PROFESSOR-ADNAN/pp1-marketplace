#!/bin/bash
set -euo pipefail

echo "=========================================="
echo "ALERT: Rolling Back SOUQ Production Stack"
echo "=========================================="

echo "[Rollback] Restoring previous healthy container state..."
docker compose -f docker/compose.prod.yaml restart api-1 api-2

echo "[Rollback] Reloading Nginx..."
docker compose -f docker/compose.prod.yaml exec nginx nginx -s reload || true

echo "[Rollback] Verifying health..."
sleep 5
bash scripts/smoke-test.sh && echo "[Rollback] System stabilized!" || echo "[Rollback] Critical: System requires manual intervention!"
