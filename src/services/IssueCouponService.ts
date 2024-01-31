import CouponModel from '../models/CouponModel';
import { BadRequestError } from '../middlewares/error';
import couponMessage from './coupon.message';
import { RequestIssueCoupon } from '@types';

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
   * @returns {boolean}
   * @private
   */
  private isCorrectTime(): boolean {
    const now = new Date();
    const start = new Date(START_TIME);
    const end = new Date(END_TIME);

    return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
  }

  /**
   * 쿠폰 발급 서비스 실행
   * @param requestIssueCoupon - 쿠폰 발급 요청 정보
   * @returns {Promise<boolean>}
   */
  async exec(requestIssueCoupon: RequestIssueCoupon): Promise<boolean> {
    // case: 쿠폰 발급 가능 시간이 아닐 경우
    if (!this.isCorrectTime()) {
      throw new BadRequestError(couponMessage.NOT_CORRECT_TIME);
    }
    const { userId } = requestIssueCoupon;

    // info: 쿠폰 발급 가능 여부 확인
    const { issuedCount, issued } = await this.couponModel.issuedCountAndIssue(userId);

    // case: 쿠폰이 모두 발급되었을 경우
    if (issuedCount >= COUPON_COUNT) {
      // info: 쿠폰 발급 취소
      await this.couponModel.removeCoupon(userId);
      throw new BadRequestError(couponMessage.NOT_ENOUGH_COUPON);
    }

    // case: 이미 쿠폰을 받은 사용자일 경우(false 일 경우)
    if (!issued) {
      throw new BadRequestError(couponMessage.USER_HAS_ALREADY_RECEIVED_THE_COUPON);
    }

    // todo: RDB 트랜잭션 처리 -> queue 처리
    return true;
  }
}
