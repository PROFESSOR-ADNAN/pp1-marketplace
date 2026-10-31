# SOUQ Technology Stack Specification

| Component | Technology | Version | Maintained Status | Rationale |
|---|---|---|---|---|
| Runtime | Node.js | v22.x LTS | Active (LTS until 2027) | High performance native fetch, test runner, ES modules |
| Backend Framework | Express | ^4.21.0 | Active (RFC compliant) | Lightweight, minimal abstraction, zero unneeded bloat |
| Language | TypeScript | ^5.6.2 | Active | Compile-time strict typing across API, worker, web, shared |
| Database | MongoDB | 7.0 | Active | Document model, single-node replica set for ACID transactions |
| ODM | Mongoose | ^8.7.0 | Active | Schema validation, hooks, indexing, transaction sessions |
| Cache & Queues | Redis | 7.4 Alpine | Active | In-memory sliding window rate limits, idempotency keys, BullMQ |
| Background Jobs | BullMQ | ^5.15.0 | Active | Robust Redis-based job queues with delayed jobs and retries |
| Frontend Framework | React | ^18.3.1 | Active | Component ecosystem, hooks, widespread production reliability |
| Bundler & Tooling | Vite | ^5.4.8 | Active | Fast HMR, optimized production rollup builds |
| Styling | Tailwind CSS | ^3.4.13 | Active | Utility-first CSS, low runtime overhead, responsive design |
| Data Fetching | TanStack Query | ^5.59.0 | Active | Cache synchronization, optimistic updates, background refetch |
| Routing | React Router | ^6.26.2 | Active | Client-side SPA routing and navigation guards |
| Localization | react-i18next | ^15.0.2 | Active | Robust i18n support for English and Amharic locales |
| Validation | Zod | ^3.23.8 | Active | TypeScript-first schema declaration and runtime validation |
| Logging | Pino | ^9.4.0 | Active | Ultra-low overhead structured JSON logging with redaction |
| Image Processing | Sharp | ^0.33.5 | Active | High-performance WebP resizing and format sanitation |
| Telemetry & Metrics | prom-client | ^15.1.3 | Active | Official Prometheus metrics client for Node.js |
| Reverse Proxy | Nginx | 1.26 Alpine | Active | High-efficiency SSL termination, caching, rate limiting |
| Observability | Prometheus | v2.54.1 | Active | Scalable time-series metrics collection |
| Log Collection | Grafana Alloy | v1.4.1 | Active | Active replacement for deprecated Promtail |
| Log Storage | Grafana Loki | v3.2.0 | Active | Lightweight log aggregation without full text indexing overhead |
| Dashboards | Grafana | v11.2.0 | Active | Visual dashboards and Alertmanager integrations |
| Testing (Unit/Int) | Vitest / Node test | Current | Active | Native ESM and fast parallel test execution |
| Testing (E2E) | Playwright | ^1.47.0 | Active | Browser automation for full checkout and verification flows |
| Testing (Load) | k6 | v0.53.0 | Active | Developer-friendly high concurrency load testing scripts |
| Containers | Docker & Compose | v27+ / v2.29+ | Active | Industry standard containerization and local dev orchestration |
| Infrastructure | OpenTofu | v1.8.2 | Active | Open-source fork of Terraform for reproducible infrastructure |
| Server Config | Ansible | ^10.4.0 | Active | Idempotent system configuration and security hardening |

*All tools confirmed active, maintained, and licensed under MIT/Apache-2.0/BSD/GNU as of November 2026.*
