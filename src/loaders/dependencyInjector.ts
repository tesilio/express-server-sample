import { Container } from 'typedi';
import LoggerInstance from './logger';

/**
 * Dependency Injector
 */
export default (): void => {
  try {
    Container.set('logger', LoggerInstance);
    LoggerInstance.info('✌️ Injected into container');
  } catch (e) {
    LoggerInstance.error(`🔥 Error on dependency injector loader: ${e}`);
    throw e;
  }
};
