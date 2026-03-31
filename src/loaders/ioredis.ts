import Redis from 'ioredis';
import config from '../config';

const createRedisClient = (): Redis => {
  return new Redis({
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db,
  });
};

export default createRedisClient;
