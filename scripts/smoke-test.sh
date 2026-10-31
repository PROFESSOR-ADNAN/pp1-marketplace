#!/bin/bash
set -euo pipefail

TARGET_HOST="${1:-http://localhost:5000}"

echo "[Smoke Test] Target: $TARGET_HOST"

echo "[1/3] Checking /healthz..."
curl -fsS "$TARGET_HOST/healthz" > /dev/null

echo "[2/3] Checking /metrics..."
curl -fsS "$TARGET_HOST/metrics" > /dev/null

echo "[3/3] Checking /api/v1/products..."
curl -fsS "$TARGET_HOST/api/v1/products?limit=1" > /dev/null

echo "[Smoke Test] All checks green!"
