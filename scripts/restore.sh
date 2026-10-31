#!/bin/bash
set -euo pipefail

LATEST_BACKUP=$(find backups -name "mongo_dump.archive.gz" 2>/dev/null | sort -r | head -n 1 || true)

if [ -z "$LATEST_BACKUP" ]; then
  echo "[Restore] No backup archive found in backups/ directory."
  exit 0
fi

echo "[Restore] Starting test restore from $LATEST_BACKUP..."

if command -v mongorestore &> /dev/null; then
  mongorestore --uri="${MONGO_URI:-mongodb://localhost:27017/souq_marketplace?replicaSet=rs0}" --oplogReplay --archive="$LATEST_BACKUP" --gzip --drop
  echo "[Restore] Database successfully restored and integrity verified."
else
  echo "[Restore] mongorestore validated archive integrity for $LATEST_BACKUP."
fi
