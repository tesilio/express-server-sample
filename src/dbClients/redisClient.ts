import Redis from 'ioredis';

/**
 * Redis 클라이언트 생성
 */
export default new Redis({
  host: 'localhost',
  port: 63798,
  db: 0,
});
