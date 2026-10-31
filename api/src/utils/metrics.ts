import client from 'prom-client';

client.collectDefaultMetrics({ prefix: 'souq_' });

export const httpRequestDuration = new client.Histogram({
  name: 'souq_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

export const orderTransitionsTotal = new client.Counter({
  name: 'souq_order_transitions_total',
  help: 'Total order state machine transitions',
  labelNames: ['from_status', 'to_status'],
});

export const inventoryReservationExpiredTotal = new client.Counter({
  name: 'souq_inventory_reservations_expired_total',
  help: 'Count of expired reservations restored',
});

export { client };
