jest.mock('ioredis', () => require('ioredis-mock')); // eslint-disable-line @typescript-eslint/no-require-imports
import Redis from 'ioredis';
import CouponModel from '../../models/redis/CouponModel';
import IssueCouponService from '../../services/IssueCouponService';
import { Logger } from 'winston';
import { BadRequestError, NotFoundError } from '../../utils/customErrors';
import couponMessage from '../../messages/coupon.message';

const COUPON_SET_KEY = 'coupon:issued-user-id-set';

const makeCouponMetadata = (quantity: number) =>
  JSON.stringify({
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-12-31T23:59:59.999Z',
    quantity,
  });

describe('쿠폰 발급 동시성 테스트', () => {
  let redis: Redis;
  let service: IssueCouponService;
  let mockLogger: Pick<Logger, 'error'>;

  const QUANTITY = 10;

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
    redis = new Redis();
    await redis.flushdb();
    await redis.set('coupon-metadata', makeCouponMetadata(QUANTITY));
    const couponModel = new CouponModel(redis);
    mockLogger = { error: jest.fn() };
    service = new IssueCouponService(couponModel, mockLogger as Logger);
  });

  afterEach(async () => {
    jest.useRealTimers();
    await redis.flushdb();
    await redis.quit();
  });

  const tryIssue = async (userId: string) => {
    try {
      const result = await service.exec({ userId });
      return { userId, status: 'success' as const, result };
    } catch (error) {
      return { userId, status: 'failed' as const, error };
    }
  };

  const waitForFireAndForget = async () => {
    for (let i = 0; i < 10; i++) await Promise.resolve();
  };

  it('고유 유저 50명 동시 요청 시 정확히 수량만큼만 발급된다', async () => {
    const userIds = Array.from({ length: 50 }, (_, i) => `user-${i}`);
    const results = await Promise.all(userIds.map(tryIssue));
    await waitForFireAndForget();

    const succeeded = results.filter((r) => r.status === 'success');
    const failed = results.filter((r) => r.status === 'failed');

    expect(succeeded).toHaveLength(QUANTITY);
    expect(failed).toHaveLength(40);

    // 실패는 모두 수량 소진 에러
    for (const f of failed) {
      expect(f.error).toBeInstanceOf(NotFoundError);
    }

    // Redis set에 정확히 수량만큼만 남아있음
    const setSize = await redis.scard(COUPON_SET_KEY);
    expect(setSize).toBe(QUANTITY);
  });

  it('같은 유저가 동시에 5번 요청해도 1번만 발급된다', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => tryIssue('same-user')));

    const succeeded = results.filter((r) => r.status === 'success');
    const duplicates = results.filter(
      (r) => r.status === 'failed' && r.error instanceof BadRequestError,
    );

    expect(succeeded).toHaveLength(1);
    expect(duplicates).toHaveLength(4);

    const setSize = await redis.scard(COUPON_SET_KEY);
    expect(setSize).toBe(1);
  });

  it('고유 유저 + 중복 유저 혼합 60요청 시 정확한 수량만 발급된다', async () => {
    // 20명 × 3회 = 60 요청
    const requests = Array.from({ length: 20 }, (_, i) => `user-${i}`).flatMap((id) => [
      id,
      id,
      id,
    ]);

    const results = await Promise.all(requests.map(tryIssue));
    await waitForFireAndForget();

    const succeeded = results.filter((r) => r.status === 'success');
    expect(succeeded).toHaveLength(QUANTITY);

    // 발급받은 유저 ID는 모두 유니크
    const issuedUserIds = new Set(succeeded.map((r) => r.userId));
    expect(issuedUserIds.size).toBe(QUANTITY);

    const setSize = await redis.scard(COUPON_SET_KEY);
    expect(setSize).toBe(QUANTITY);
  });

  it('수량 0이면 아무도 발급받지 못한다', async () => {
    await redis.set('coupon-metadata', makeCouponMetadata(0));
    service = new IssueCouponService(new CouponModel(redis), mockLogger as Logger);

    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => tryIssue(`user-${i}`)));
    await waitForFireAndForget();

    const succeeded = results.filter((r) => r.status === 'success');
    expect(succeeded).toHaveLength(0);

    const setSize = await redis.scard(COUPON_SET_KEY);
    expect(setSize).toBe(0);
  });

  it('수량 1이면 정확히 1명만 발급받는다', async () => {
    await redis.set('coupon-metadata', makeCouponMetadata(1));
    service = new IssueCouponService(new CouponModel(redis), mockLogger as Logger);

    const results = await Promise.all(Array.from({ length: 20 }, (_, i) => tryIssue(`user-${i}`)));
    await waitForFireAndForget();

    const succeeded = results.filter((r) => r.status === 'success');
    expect(succeeded).toHaveLength(1);

    const setSize = await redis.scard(COUPON_SET_KEY);
    expect(setSize).toBe(1);
  });

  it('발급 성공 후 같은 유저가 재요청하면 중복 발급 에러가 발생한다', async () => {
    const firstResult = await tryIssue('user-1');
    expect(firstResult.status).toBe('success');

    const secondResult = await tryIssue('user-1');
    expect(secondResult.status).toBe('failed');
    expect(secondResult.error).toEqual(
      new BadRequestError(couponMessage.USER_HAS_ALREADY_RECEIVED_THE_COUPON),
    );
  });

  it('수량 소진 후 추가 요청은 모두 실패한다', async () => {
    // 먼저 수량만큼 발급
    const firstBatch = await Promise.all(
      Array.from({ length: QUANTITY }, (_, i) => tryIssue(`user-${i}`)),
    );
    expect(firstBatch.every((r) => r.status === 'success')).toBe(true);

    // 추가 요청은 모두 실패
    const secondBatch = await Promise.all(
      Array.from({ length: 10 }, (_, i) => tryIssue(`late-user-${i}`)),
    );
    await waitForFireAndForget();

    expect(secondBatch.every((r) => r.status === 'failed')).toBe(true);
    for (const r of secondBatch) {
      expect(r.error).toBeInstanceOf(NotFoundError);
    }

    const setSize = await redis.scard(COUPON_SET_KEY);
    expect(setSize).toBe(QUANTITY);
  });
});
