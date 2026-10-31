# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-11-01
### Added
- Complete architecture specification and 11 Architectural Decision Records (ADRs).
- Strict integer santim financial handling across domain entities.
- Two-phase inventory reservation algorithm and BullMQ delay queue.
- Chapa payment integration with server-side HMAC verification and idempotency keys.
- Order finite state machine with audit trails.
- Local dev Docker Compose setup with MongoDB single-node replica set, Redis, MinIO, and Mailpit.
- React 18 / Vite / Tailwind SPA with English and Amharic i18n support.
