// @ts-ignore
import http from 'k6/http';
// @ts-ignore
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// init context: k6 옵션을 정의한다.
export const options = {
  vus: 100,
  duration: '10s',
};

export default function () {
  const url = 'http://[::1]:3000/v1/coupons/issues';
  const payload = JSON.stringify({
    userId: uuidv4(),
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}


