import Redis from 'ioredis';

const COUPON_SET_KEY = 'coupon:issued-user-id-set';

class CouponModel {
  constructor(private redisClient: Redis) {}

  async increaseRequestCount(): Promise<number> {
    return this.redisClient.incr('coupon:request-count');
  }

  async getCouponMetadata(): Promise<string | null> {
    return this.redisClient.get('coupon-metadata');
  }

  async getAlreadyIssuedQuantityAndIssue(
    userId: string,
  ): Promise<{ alreadyIssuedQuantity: number; issued: boolean }> {
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

  async cancelIssuing(userId: string): Promise<number> {
    return this.redisClient.srem(COUPON_SET_KEY, userId);
  }

  async increaseIssuedCouponCount(): Promise<number> {
    return this.redisClient.incr('coupon:issued-count');
  }
}

export default CouponModel;
