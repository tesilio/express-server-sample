import CouponModel from '../models/CouponModel';
import { BadRequestError } from '../middlewares/error';
import couponMessage from './coupon.message';

const COUPON_COUNT = 100;

// 쿠폰 발급 가능 시간 시간
const START_TIME = '2024-01-01 00:00:00';

// 쿠폰 발급 가능 종료 시간
const END_TIME = '2024-12-31 23:59:59';

/**
 * 쿠폰 발급 서비스
 */
export default class IssueCouponService {
  private couponModel: CouponModel;

  constructor() {
    this.couponModel = new CouponModel();
  }

  /**
   * 쿠폰 발급 가능 시간 확인
   */
  private isCorrectTime(): boolean {
    const now = new Date();
    const start = new Date(START_TIME);
    const end = new Date(END_TIME);

    return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
  }

  /**
   * 쿠폰 발급 서비스 실행
   * @param requestBody - 요청 바디
   * @returns {Promise<void>}
   */
  async exec(requestBody: any) {
    // todo: requestBody 검증 코드
    // case: 쿠폰 발급 가능 시간이 아닐 경우
    if (!this.isCorrectTime()) {
      throw new Error('쿠폰 발급 시간이 아닙니다.');
    }
    const { userId } = requestBody;

    // info: 쿠폰 발급 가능 여부 확인
    const { issuedCount, issued } = await this.couponModel.issuedCountAndIssue(userId);

    // case: 쿠폰이 모두 발급되었을 경우
    if (issuedCount >= COUPON_COUNT) {
      // info: 쿠폰 발급 취소
      await this.couponModel.removeCoupon(userId);
      throw new Error('남은 쿠폰이 없습니다.');
    }

    // case: 이미 쿠폰을 받은 사용자일 경우
    if (issued) {
      throw new Error(`사용자 ${userId}는 이미 쿠폰을 받았습니다.`);
    }

    // todo: RDB 트랜잭션 처리 -> queue 처리
    return true;
  }
}
