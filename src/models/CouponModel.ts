import redisClient from '../db/redisClient';
import Redis from 'ioredis';

const COUPON_SET_KEY = 'coupon:issued-user-id-set';

export default class CouponModel {
  private redisClient: Redis;

  constructor() {
    this.redisClient = redisClient;
  }

  /**
   * 사용자에게 쿠폰 발급 후 발급된 쿠폰 개수 반환
   * @param {string} userId
   * @returns {Promise<{ count: number; issued: boolean }>}
   */
  async issuedCountAndIssue(userId: string): Promise<{ issuedCount: number; issued: boolean }> {
    const result = await this.redisClient
      .multi()
      .scard(COUPON_SET_KEY)
      .sadd(COUPON_SET_KEY, userId)
      .exec();
    return {
      issuedCount: Number(result?.[0][1]) || 0,
      issued: result?.[1][1] === 1,
    };
  }

  /**
   * 사용자에게 발급된 쿠폰 삭제
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async removeCoupon(userId: string): Promise<number> {
    return this.redisClient.srem(COUPON_SET_KEY, userId);
  }
}
