import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  throw new Error(`⚠️ Couldn't find .env file ⚠️`);
}

export default {
  env: process.env.NODE_ENV,
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  port: parseInt(process.env.PORT || '3000', 10),
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    db: parseInt(process.env.REDIS_DB ?? '0', 10),
  },
};
