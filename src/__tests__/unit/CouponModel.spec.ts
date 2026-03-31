jest.mock('ioredis', () => require('ioredis-mock')); // eslint-disable-line @typescript-eslint/no-require-imports
import Redis from 'ioredis';
import CouponModel from '../../models/redis/CouponModel';

describe('CouponModel', () => {
  let redis: Redis;
  let couponModel: CouponModel;

  beforeEach(async () => {
    redis = new Redis();
    couponModel = new CouponModel(redis);
    await redis.flushdb();
  });

  afterEach(async () => {
    await redis.flushdb();
    await redis.quit();
  });

  describe('increaseRequestCount', () => {
    it('요청 횟수를 1 증가시킨다', async () => {
      const count1 = await couponModel.increaseRequestCount();
      expect(count1).toBe(1);
      const count2 = await couponModel.increaseRequestCount();
      expect(count2).toBe(2);
    });
  });

  describe('getCouponMetadata', () => {
    it('메타데이터가 없으면 null을 반환한다', async () => {
      const result = await couponModel.getCouponMetadata();
      expect(result).toBeNull();
    });

    it('메타데이터가 있으면 문자열을 반환한다', async () => {
      const metadata = JSON.stringify({
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        quantity: 100,
      });
      await redis.set('coupon-metadata', metadata);
      const result = await couponModel.getCouponMetadata();
      expect(result).toBe(metadata);
    });
  });

  describe('getAlreadyIssuedQuantityAndIssue', () => {
    it('새로운 사용자에게 쿠폰을 발급한다', async () => {
      const result = await couponModel.getAlreadyIssuedQuantityAndIssue('user1');
      expect(result.alreadyIssuedQuantity).toBe(0);
      expect(result.issued).toBe(true);
    });

    it('이미 발급받은 사용자는 issued가 false', async () => {
      await couponModel.getAlreadyIssuedQuantityAndIssue('user1');
      const result = await couponModel.getAlreadyIssuedQuantityAndIssue('user1');
      expect(result.issued).toBe(false);
    });

    it('발급 수량을 올바르게 추적한다', async () => {
      await couponModel.getAlreadyIssuedQuantityAndIssue('user1');
      const result = await couponModel.getAlreadyIssuedQuantityAndIssue('user2');
      expect(result.alreadyIssuedQuantity).toBe(1);
      expect(result.issued).toBe(true);
    });
  });

  describe('cancelIssuing', () => {
    it('발급된 쿠폰을 취소한다', async () => {
      await couponModel.getAlreadyIssuedQuantityAndIssue('user1');
      const removed = await couponModel.cancelIssuing('user1');
      expect(removed).toBe(1);
    });

    it('존재하지 않는 사용자 취소 시 0을 반환한다', async () => {
      const removed = await couponModel.cancelIssuing('nonexistent');
      expect(removed).toBe(0);
    });
  });

  describe('increaseIssuedCouponCount', () => {
    it('발급 횟수를 증가시킨다', async () => {
      const count = await couponModel.increaseIssuedCouponCount();
      expect(count).toBe(1);
    });
  });
});
