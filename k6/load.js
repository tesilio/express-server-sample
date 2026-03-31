// @ts-ignore
import http from 'k6/http';
// @ts-ignore
import { check } from 'k6';
// @ts-ignore
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const url = 'http://localhost:3000/v1/coupons/issues';
  const payload = JSON.stringify({ userId: uuidv4() });
  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post(url, payload, params);
  check(res, {
    'status is 200 or 400 or 429': (r) => [200, 400, 429].includes(r.status),
  });
}
