// @ts-ignore
import http from 'k6/http';

// init context: k6 옵션을 정의한다.
export const options = {
  vus: 100,
  duration: '10s',
};

export default function () {
  const url = 'http://[::1]:3000/v1/coupons/issue';
  const userId = `userId-${Math.floor(Math.random() * 1000000)}`;
  const payload = JSON.stringify({
    userId,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}


