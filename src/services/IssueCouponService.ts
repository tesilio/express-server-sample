import CouponModel from '../models/CouponModel';
import { BadRequestError } from '../middlewares/error';
import couponMessage from './coupon.message';

const COUPON_COUNT = 5;

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
  };

  /**
   * 발급된 쿠폰 개수 조회
   * @returns {Promise<number>}
   */
  private async getCouponCount(): Promise<number> {
    return this.couponModel.count();
  };

  /**
   * 사용자에게 쿠폰 발급
   * @param {string} userId - 사용자 ID
   * @returns {Promise<boolean>}
   */
  private async issueCoupon(userId: string): Promise<boolean> {
    return this.couponModel.issue(userId);
  };

  /**
   * 쿠폰 발급 서비스 실행
   * @param requestBody - 요청 바디
   * @returns {Promise<void>}
   */
  async exec(_requestBody: any) {
    // todo: 에러 정상 노출 하기
    throw new BadRequestError(couponMessage.NOT_CORRECT_TIME);
//    // todo: requestBody 검증 코드
//    if (!this.isCorrectTime()) {
//      throw new Error('쿠폰 발급 시간이 아닙니다.');
//    }
//
//    try {
//      const issuedCouponCount = await this.getCouponCount();
//
//      if (issuedCouponCount >= COUPON_COUNT) {
//        throw new Error('남은 쿠폰이 없습니다.');
//      }
//
//      const { userId } = requestBody;
//
//      const result = await this.issueCoupon(userId);
//      if (!result) {
//        throw new Error(`사용자 ${userId}는 이미 쿠폰을 받았습니다.`);
//      }
//
//      console.log(`${userId}에게 쿠폰을 발급했습니다.`);
//      // todo: 비동기로 RDBMS에 사용자 쿠폰 발급 정보를 저장하는 코드
//    } catch (e) {
//      console.error(e);
//      throw new Error(`알 수 없는 에러가 발생했습니다.`);
//    }
    return true;
  };
}
