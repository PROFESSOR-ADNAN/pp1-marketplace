# ADR 0011: TypeScript Across API, Worker, Web, and Packages

## Status
Accepted

## Context
The marketplace features complex multi-vendor models, state machines, financial calculations in integer santim, and API contracts. JavaScript runtime type mismatches in financial or stock logic cause critical bugs.

## Decision
Adopt strict TypeScript across all workspaces:
- `packages/shared`: Shared Zod schemas, domain models, enum constants, and TypeScript types.
- `api`: Express REST API in strict TypeScript.
- `worker`: BullMQ background jobs in strict TypeScript.
- `web`: React 18+ SPA in strict TypeScript.

## Alternatives Considered
- **Plain JavaScript with JSDoc:** Incomplete compile-time guarantees and prone to subtle interface drift between API and client.

## Consequences
- **Positive:** Type-safe domain models, shared validation schemas between frontend and backend, autocomplete, early detection of errors.
- **Negative:** Requires build step (`tsc` / `vite build`).
