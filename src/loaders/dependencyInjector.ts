import { Container } from 'typedi';
import LoggerInstance from './logger';

/**
 * Dependency Injector
 */
export default ({ models }: { models: any[] }): void => {
  try {
    models.forEach((model) => {
      Container.set(model.name, new model());
    });
    Container.set('logger', LoggerInstance);
    LoggerInstance.info('✌️ Injected into container');
  } catch (e) {
    LoggerInstance.error(`🔥 Error on dependency injector loader: ${e}`);
    throw e;
  }
};
