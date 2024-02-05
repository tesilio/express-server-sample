import 'reflect-metadata';
import config from './config';
import express from 'express';
import LoggerInstance from './loaders/logger';


/**
 * 서버 시작
 * @returns {Promise<void>}
 */
const startServer = async (): Promise<void> => {
  const app = express();
  await require('./loaders').default({ expressApp: app });

  app.listen(config.port, () => {
    LoggerInstance.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `);
  }).on('error', err => {
    LoggerInstance.error(err);
    process.exit(1);
  });
};

startServer();
