import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp to 50 users
    { duration: '3m', target: 200 }, // Sustain 200 users (Target: 200 virtual users passes)
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<800'], // Numeric targets from Section 20
    http_req_failed: ['rate<0.005'],               // Error rate < 0.5%
  },
};

export default function () {
  const res = http.get('http://localhost:5000/api/v1/products?limit=20');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has products': (r) => JSON.parse(r.body).products.length > 0,
  });
  sleep(1);
}
