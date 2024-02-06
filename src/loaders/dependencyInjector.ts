import { Container } from 'typedi';
import LoggerInstance from './logger';

/**
 * Dependency Injector
 */
export default ({ redisModels }: { redisModels: any[] }): void => {
  try {
    redisModels.forEach((redisModel) => {
      Container.set(redisModel.name, new redisModel());
    });
    Container.set('logger', LoggerInstance);
    LoggerInstance.info('✌️ Injected into container');
  } catch (e) {
    LoggerInstance.error(`🔥 Error on dependency injector loader: ${e}`);
    throw e;
  }
};
