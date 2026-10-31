# ADR 0004: Strict Order State Machine

## Status
Accepted

## Context
Multi-vendor marketplaces handle complex order lifecycles (buyers, sellers, admins, payment gateways). Unrestricted status transitions lead to fraud, invalid refunds, and shipping confusion.

## Decision
Implement an immutable, finite state machine (FSM) in code:
- States: `PENDING_PAYMENT`, `PAID`, `CONFIRMED_BY_SELLER`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `EXPIRED`, `REFUNDED`.
- Transitions are strictly validated:
  - `PENDING_PAYMENT` -> `PAID` | `EXPIRED` | `CANCELLED`
  - `PAID` -> `CONFIRMED_BY_SELLER` | `CANCELLED`
  - `CONFIRMED_BY_SELLER` -> `SHIPPED`
  - `SHIPPED` -> `DELIVERED`
  - `CANCELLED` -> `REFUNDED`
- Every transition emits an audit log and queue events (e.g. notifications, ledger updates). Unauthorized transitions throw a `400 Bad Request` or `403 Forbidden`.

## Alternatives Considered
- **Ad-hoc status updates in controllers:** Causes race conditions and invalid state jumps (e.g. cancelling an already shipped order).

## Consequences
- **Positive:** Complete deterministic auditability and protection against illegal workflow states.
- **Negative:** Extra state validation logic required for all mutations.
