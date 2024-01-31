import redisClient from '../db/redisClient';
import Redis from 'ioredis';

const COUPON_SET_KEY = 'coupon:issued-user-id-set';

export default class CouponModel {
  private redisClient: Redis;

  constructor() {
    this.redisClient = redisClient;
  }

  /**
   * 요청 횟수 증가
   * @returns {Promise<number>}
   */
  async increaseRequestCount(): Promise<number> {
    return this.redisClient.incr('coupon:request-count');
  }

  /**
   * 쿠폰 메타데이터 반환
   * @returns {Promise<string | null>}
   */
  async getCouponMetadata(): Promise<string | null>{
    return this.redisClient.get('coupon-metadata');
  }

  /**
   * 사용자에게 쿠폰 발급 후 발급된 쿠폰 개수 반환
   * @param {string} userId
   * @returns {Promise<{ alreadyIssuedQuantity: number; issued: boolean }>}
   */
  async getAlreadyIssuedQuantityAndIssue(userId: string): Promise<{ alreadyIssuedQuantity: number; issued: boolean }> {
    const result = await this.redisClient
      .multi()
      .scard(COUPON_SET_KEY)
      .sadd(COUPON_SET_KEY, userId)
      .exec();
    return {
      alreadyIssuedQuantity: Number(result?.[0][1]) || 0,
      issued: result?.[1][1] === 1,
    };
  }

  /**
   * 사용자에게 발급된 쿠폰 삭제
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async cancelIssuing(userId: string): Promise<number> {
    return this.redisClient.srem(COUPON_SET_KEY, userId);
  }

  /**
   * 쿠폰 발급 개수 증가
   * @returns {Promise<number>}
   */
  async increaseIssuedCouponCount(): Promise<number> {
    return this.redisClient.incr('coupon:issued-count');
  }
}
