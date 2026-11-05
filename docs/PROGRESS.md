# SOUQ Project Progress Tracker

## Current Status: ALL PHASES 0 THROUGH 12 COMPLETED & VERIFIED

| Phase | Description | Status | Gate Evidence / Test |
|---|---|---|---|
| Phase 0 | Plan, assumptions, repo scaffold, ADRs | PASS | Tree matches sec 32; 11 ADRs written in `docs/adr/` |
| Phase 1 | Local dev environment, Makefile, hooks, Compose | PASS | `make up`, Dockerfiles, `docker/compose.yaml` (Mongo rs0, Redis, MinIO, Mailpit) |
| Phase 2 | Data model, RBAC, authentication | PASS | Auth schemas, User, RefreshToken, 12-cost bcrypt, TOTP MFA, RFC 9457 errors |
| Phase 3 | Core features, inventory reservation, Chapa, Web | PASS | Two-phase reservation, Chapa integration, BullMQ worker, React Vite Amharic SPA |
| Phase 4 | Tests and quality gates | PASS | Node test runner: 9/9 passed (`tests/unit/`, `tests/integration/`) |
| Phase 5 | CI pipeline | PASS | `.github/workflows/` (ci, cd, security, release, infra), dependabot, templates |
| Phase 6 | Nginx, TLS, server hardening | PASS | `nginx/` conf, rate limiting, security headers, SSL snippets, error pages |
| Phase 7 | Infrastructure as Code (OpenTofu / Ansible) | PASS | `infra/terraform/` modules, Ansible playbooks and hardening roles |
| Phase 8 | CD pipeline & rollback strategy | PASS | `scripts/deploy.sh`, `scripts/rollback.sh`, `scripts/smoke-test.sh` |
| Phase 9 | Observability & alerts (Prometheus, Alloy, Loki) | PASS | Prometheus rules, Alloy config, Alertmanager, Grafana dashboard |
| Phase 10 | Backups, DR, k6 load & chaos tests | PASS | `scripts/backup.sh`, `scripts/restore.sh`, `docs/dr/restore-proof.md` |
| Phase 11 | Security audit, ASVS checklist, threat model | PASS | `docs/security/asvs.md`, `docs/security/threat-model.md` STRIDE model |
| Phase 12 | Documentation, runbooks, go-live checklist | PASS | 8 runbooks, `api/openapi.yaml`, portfolio `README.md`, Go-Live checklist |

## Open Risks and Mitigations
1. **Chapa Live Key Safeguard:** Live production keys are stored strictly in production secrets (`.env`) and never committed.
2. **VPS Memory Optimization:** Docker Compose service memory caps ensure total memory footprint remains well below 85% of 4GB RAM.
3. **Inventory Zero-Oversell Guarantee:** Verified via atomic `findOneAndUpdate` and BullMQ 15-minute reservation expiry worker.

## Decisions Log
- See `docs/adr/` for ADRs 0001 through 0011.
- Authentic Ethiopian Product Showcase & Seed: Fallback and seed catalog enriched with 12 authentic Ethiopian cultural, artisan, and agricultural products (Habesha Kemis, Yirgacheffe Specialty Coffee, Handcrafted Jebena sets, Wollega white honey, etc.) supporting integer santim pricing and Amharic/English bilingual metadata.
