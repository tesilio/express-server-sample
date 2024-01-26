import Redis from 'ioredis';

// Redis 클라이언트 생성
const redis = new Redis({
  host: 'localhost',
  port: 63798,
  db: 0,
});

/**
 * 쿠폰 발급 횟수 증가
 * @returns {Promise<number>}
 */
const increaseCouponCount = async (): Promise<number>=> {
  return redis.incr(`coupon:count`);
};

/**
 * 사용자에게 쿠폰 발급
 * @param {string} userId
 * @returns {Promise<number>}
 */
const issueCoupon = async (userId: string): Promise<number> => {
  return redis.sadd(`coupon:issued-user-id-set`, userId);
};

const exec = async () => {
  const userId = `user-${(Math.random() * 100000).toFixed(0)}`; // 예시 사용자 ID

  const result = await issueCoupon(userId);
  if (result === 0) {
    throw new Error(`사용자 ${userId}는 이미 쿠폰을 받았습니다.`);
  }

  const couponCount = await increaseCouponCount();

  if (couponCount > 10) {
    throw new Error('남은 쿠폰이 없습니다.');
  }
  console.log(`${userId}에게 쿠폰을 발급했습니다.`);
  // todo: 비동기로 RDBMS에 사용자 쿠폰 발급 정보를 저장하는 코드
};

exec();
process.exit(0);
