import Redis from 'ioredis';
import config from '../config';

const createRedisClient = (): Redis => {
  return new Redis({
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db,
    lazyConnect: false,
    keepAlive: 10000,
    retryStrategy: (times: number) => {
      if (times > 10) return null;
      return Math.min(times * 200, 2000);
    },
  });
};

export default createRedisClient;
