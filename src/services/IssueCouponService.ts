import CouponModel from '../models/redis/CouponModel';
import { BadRequestError, NotFoundError } from '../utils/customErrors';
import couponMessage from '../messages/coupon.message';
import { CouponMetadata, RequestIssueCoupon, ResponseIssueCoupon } from '@types';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';

/**
 * 쿠폰 발급 서비스
 */
@Service()
export default class IssueCouponService {
  /**
   * 생성자
   */
  constructor(
    @Inject('CouponModel') private couponModel: CouponModel,
    @Inject('logger') private logger: Logger,
  ) {}

  /**
   * 요청 횟수 증가
   * @returns {Promise<void>}
   * @private
   */
  private async increaseRequestCount(): Promise<void> {
    await this.couponModel.increaseRequestCount();
  }

  /**
   * 쿠폰 메타데이터 반환
   * @returns {Promise<CouponMetadata>}
   * @private
   */
  private async getCouponMetadata(): Promise<CouponMetadata> {
    const couponMetadata = await this.couponModel.getCouponMetadata();
    if (couponMetadata === null) {
      throw new BadRequestError(couponMessage.NOT_FOUND_COUPON_METADATA);
    }
    return JSON.parse(couponMetadata);
  }

  /**
   * 쿠폰 발급 가능 시간 확인
   * @param {string} startTime - 쿠폰 발급 가능 시작 시간
   * @param {string} endTime - 쿠폰 발급 가능 종료 시간
   * @returns {boolean}
   * @private
   */
  private checkCorrectTime(startTime: string, endTime: string): void {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    const result = now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
    if (!result) {
      throw new BadRequestError(couponMessage.NOT_CORRECT_TIME);
    }
  }

  /**
   * 발급된 쿠폰 개수, 사용자에게 쿠폰 발급 여부 반환
   * @param {string} userId - 사용자 아이디
   * @returns {Promise<{alreadyIssuedQuantity: number, issued: boolean}>}
   * @private
   */
  private async getAlreadyIssuedQuantityAndIssue(userId: string): Promise<{
    alreadyIssuedQuantity: number;
    issued: boolean;
  }> {
    return this.couponModel.getAlreadyIssuedQuantityAndIssue(userId);
  }

  /**
   * 쿠폰 발급 취소 및 에러 발생
   * @param {string} userId
   * @returns {Promise<void>}
   * @private
   */
  private async cancelIssuingAndThrowError(userId: string): Promise<void> {
    // info: 쿠폰 발급 취소
    this.couponModel.cancelIssuing(userId).catch((error) => {
      this.logger.error('쿠폰 발급 취소 에러:', error);
    });
    throw new NotFoundError(couponMessage.NOT_ENOUGH_COUPON);
  }

  /**
   * 쿠폰 발급 개수 증가
   * @returns {Promise<void>}
   * @private
   */
  private async increaseIssuedCouponCount(): Promise<void> {
    await this.couponModel.increaseIssuedCouponCount();
  }

  /**
   * 쿠폰 발급 서비스 실행
   * @param requestIssueCoupon - 쿠폰 발급 요청 정보
   * @returns {Promise<boolean>}
   */
  async exec(requestIssueCoupon: RequestIssueCoupon): Promise<ResponseIssueCoupon> {
    // info: 쿠폰 발급 요청 횟수 증가
    this.increaseRequestCount().catch((error) => {
      this.logger.error('쿠폰 발급 요청 횟수 증가 에러:', error);
    });

    const { startTime, endTime, quantity } = await this.getCouponMetadata();

    // info: 쿠폰 발급 가능 시간 확인
    this.checkCorrectTime(startTime, endTime);

    const { userId } = requestIssueCoupon;

    // info: 쿠폰 발급 가능 여부 확인
    const { alreadyIssuedQuantity, issued } = await this.getAlreadyIssuedQuantityAndIssue(userId);

    // case: 쿠폰 발급 가능 개수가 없고, 이 요청에서 쿠폰을 발급받은 사용자일 경우
    if (alreadyIssuedQuantity >= quantity && issued) {
      // info: 쿠폰 발급 취소 및 에러 발생
      await this.cancelIssuingAndThrowError(userId);
    }

    // case: 이미 예전 요청에서 쿠폰을 받은 사용자일 경우
    if (!issued) {
      throw new BadRequestError(couponMessage.USER_HAS_ALREADY_RECEIVED_THE_COUPON);
    }

    // info: 쿠폰 발급 개수 증가
    this.increaseIssuedCouponCount().catch((error) => {
      this.logger.error('쿠폰 발급 개수 증가 에러:', error);
    });

    // todo: RDB 트랜잭션 처리 -> queue 처리 -> 실제 유효한 로직은 여기서부터!

    return {
      issued: true,
    };
  }
}
