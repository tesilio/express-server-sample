import config from './config';
import app, { deps } from './app';
import LoggerInstance from './loaders/logger';

const server = app.listen(config.port, () => {
  LoggerInstance.info(`Server listening on port: ${config.port}`);
});

server.on('error', (err) => {
  LoggerInstance.error(err);
  process.exit(1);
});

const shutdown = () => {
  LoggerInstance.info('Shutting down gracefully...');
  server.close(() => {
    deps.redisClient
      .quit()
      .then(() => {
        LoggerInstance.info('Redis connection closed');
        process.exit(0);
      })
      .catch(() => {
        process.exit(1);
      });
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
