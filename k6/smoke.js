// @ts-ignore
import http from 'k6/http';
// @ts-ignore
import { check } from 'k6';

export const options = {
  vus: 1,
  duration: '5s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const statusRes = http.get('http://localhost:3000/status');
  check(statusRes, { 'status is 200': (r) => r.status === 200 });

  const helloRes = http.get('http://localhost:3000/v1/');
  check(helloRes, {
    'hello status is 200': (r) => r.status === 200,
    'hello has message': (r) => JSON.parse(r.body).message === 'Hello World!',
  });
}
