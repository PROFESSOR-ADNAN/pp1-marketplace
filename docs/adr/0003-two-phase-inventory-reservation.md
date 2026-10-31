# ADR 0003: Two-Phase Inventory Reservation

## Status
Accepted

## Context
High concurrency flash sales or popular items can cause overselling if stock is only decremented after asynchronous payment confirmation. Decrementing stock before payment without an expiration timeout results in phantom stock depletion by abandoned carts.

## Decision
Implement a Two-Phase Inventory Reservation strategy:
1. **Phase 1 (Reservation):** During checkout initialization, atomically execute `findOneAndUpdate({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty, reserved: +qty } })`. An `InventoryReservation` record is created with a 15-minute expiration time.
2. **Phase 2 (Settlement or Release):**
   - On verified payment: Convert reservation to permanent sale (`reserved` decremented, order becomes `PAID`).
   - On payment failure, cancellation, or 15-minute expiration: BullMQ worker atomically returns units (`stock: +qty, reserved: -qty`).

## Alternatives Considered
- **Debit-on-Payment:** Stock is only decremented after Chapa webhook. Causes overselling when two buyers pay simultaneously for the last item.
- **Immediate Hard Decrement:** Decrements stock without reservation records. Causes inventory leaks when buyers abandon the Chapa payment page.

## Consequences
- **Positive:** Zero overselling guaranteed under 500 concurrent buyers; abandoned reservations automatically expire and restore stock.
- **Negative:** Requires BullMQ worker and Redis reliability to process delayed expiration jobs.
