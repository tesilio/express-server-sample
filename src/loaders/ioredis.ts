import Redis from 'ioredis';
import config from '../config';

/**
 * Redis 클라이언트 생성
 */
export default new Redis({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db,
});
