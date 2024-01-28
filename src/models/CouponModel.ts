import redisClient from '../db/redisClient';
import Redis from 'ioredis';

const COUPON_SET_KEY = 'coupon:issued-user-id-set';

export default class CouponModel {
  private redisClient: Redis;
  constructor() {
    this.redisClient = redisClient;
  }

  /**
   * 사용자에게 쿠폰 발급
   * @param {string} userId - 사용자 ID
   * @returns {Promise<boolean>}
   */
  async issue(userId: string): Promise<boolean>{
    const result = await this.redisClient.sadd(COUPON_SET_KEY, userId);
    return result === 1;
  }

  /**
   * 발급된 쿠폰 개수 조회
   * @returns {Promise<number>}
   */
  async count(): Promise<number> {
    return this.redisClient.scard(COUPON_SET_KEY);
  }
}
