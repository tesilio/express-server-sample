import expressLoader from './express';
import createRedisClient from './ioredis';
import LoggerInstance from './logger';
import CouponModel from '../models/redis/CouponModel';
import IssueCouponService from '../services/IssueCouponService';
import IndexService from '../services/IndexService';
import express from 'express';
import Redis from 'ioredis';

export interface AppDependencies {
  indexService: IndexService;
  issueCouponService: IssueCouponService;
  redisClient: Redis;
}

const initApp = (app: express.Application): AppDependencies => {
  const redisClient = createRedisClient();
  const couponModel = new CouponModel(redisClient);
  const issueCouponService = new IssueCouponService(couponModel, LoggerInstance);
  const indexService = new IndexService();

  LoggerInstance.info('Dependency injection initialized');

  expressLoader({ app, indexService, issueCouponService });
  LoggerInstance.info('Express loaded');

  return { indexService, issueCouponService, redisClient };
};

export default initApp;
