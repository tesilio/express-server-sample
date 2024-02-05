import dependencyInjectorLoader from './dependencyInjector';
import expressLoader from './express';
import Logger from './logger';

/**
 * 로더 설정
 * @param {any} expressApp - 익스프레스 앱
 * @returns {Promise<void>}
 */
export default async ({ expressApp }: any): Promise<void> => {
  await dependencyInjectorLoader();
  Logger.info('✌️ Dependency Injector loaded');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};
