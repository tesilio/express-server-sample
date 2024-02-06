import dependencyInjectorLoader from './dependencyInjector';
import expressLoader from './express';
import Logger from './logger';
import CouponModel from '../models/redis/CouponModel';

/**
 * 로더 설정
 * @param {any} expressApp - 익스프레스 앱
 * @returns {Promise<void>}
 */
export default async ({ expressApp }: any): Promise<void> => {
  const redisModels = [CouponModel];
  await dependencyInjectorLoader({ redisModels });
  Logger.info('✌️ Dependency Injector loaded');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};
