import request from 'supertest';
import app, { deps } from '../../app';

afterAll(async () => {
  await deps.redisClient.quit();
});

describe('API Integration Tests', () => {
  describe('GET /status', () => {
    it('200을 반환한다', async () => {
      const res = await request(app).get('/status');
      expect(res.status).toBe(200);
    });
  });

  describe('헬스체크 헤더', () => {
    it('helmet 보안 헤더가 포함되어 있다', async () => {
      const res = await request(app).get('/status');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('X-Request-Id 헤더가 포함되어 있다', async () => {
      const res = await request(app).get('/status');
      expect(res.headers['x-request-id']).toBeDefined();
      expect(typeof res.headers['x-request-id']).toBe('string');
      expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
    });
  });

  describe('GET /v1/', () => {
    it('Hello World 메시지를 반환한다', async () => {
      const res = await request(app).get('/v1/');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Hello World!' });
    });
  });

  describe('POST /v1/coupons/issues', () => {
    it('userId 없이 요청하면 400을 반환한다', async () => {
      const res = await request(app).post('/v1/coupons/issues').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.status).toBe(400);
    });

    it('빈 userId로 요청하면 400을 반환한다', async () => {
      const res = await request(app).post('/v1/coupons/issues').send({ userId: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /nonexistent', () => {
    it('존재하지 않는 경로는 404를 반환한다', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.status).toBe(404);
      expect(res.body.error.errorCode).toBe('ERR000000');
    });
  });

  describe('Rate Limiting', () => {
    it('쿠폰 엔드포인트에 연속 요청 시 429를 반환한다', async () => {
      const requests = Array.from({ length: 12 }, () =>
        request(app).post('/v1/coupons/issues').send({ userId: 'rate-limit-test' }),
      );
      const responses = await Promise.all(requests);
      const tooMany = responses.filter((r) => r.status === 429);
      expect(tooMany.length).toBeGreaterThan(0);
    });
  });
});
