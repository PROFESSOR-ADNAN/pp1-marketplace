.PHONY: all help up down build logs ps test test-unit test-integration test-e2e test-concurrency lint seed migrate backup restore

help:
	@echo "SOUQ Multi-Vendor Marketplace Commands:"
	@echo "  make up               Start dev stack in Docker (Mongo, Redis, MinIO, Mailpit)"
	@echo "  make down             Stop dev stack"
	@echo "  make build            Build all Docker images"
	@echo "  make logs             Follow container logs"
	@echo "  make test             Run all unit and integration tests"
	@echo "  make test-concurrency Run 500-buy concurrency stress test"
	@echo "  make seed             Seed database with sample categories, sellers, and products"
	@echo "  make lint             Run ESLint and TypeScript type checking"
	@echo "  make backup           Perform MongoDB oplog backup"
	@echo "  make restore          Run test restore from backup archive"

up:
	docker compose -f docker/compose.yaml up -d --build
	@echo "Stack is running! Web: http://localhost:5173, API: http://localhost:5000/healthz, Mail: http://localhost:8025"

down:
	docker compose -f docker/compose.yaml down

build:
	docker compose -f docker/compose.yaml build

logs:
	docker compose -f docker/compose.yaml logs -f

ps:
	docker compose -f docker/compose.yaml ps

test:
	npm run test --workspaces --if-present

test-unit:
	npm run test:unit --workspace=api

test-integration:
	npm run test:integration --workspace=api

test-concurrency:
	node tests/integration/inventory-concurrency.test.js

lint:
	npm run lint --workspaces --if-present

seed:
	node scripts/seed.js

backup:
	bash scripts/backup.sh

restore:
	bash scripts/restore.sh
