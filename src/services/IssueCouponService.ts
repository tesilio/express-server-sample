import CouponModel from '../models/redis/CouponModel';
import { BadRequestError, NotFoundError } from '../utils/customErrors';
import couponMessage from '../messages/coupon.message';
import { CouponMetadata, RequestIssueCoupon, ResponseIssueCoupon } from '../types';
import { Logger } from 'winston';
import CouponMetadataCache from './CouponMetadataCache';

class IssueCouponService {
  private metadataCache: CouponMetadataCache;

  constructor(
    private couponModel: CouponModel,
    private logger: Logger,
    metadataCache?: CouponMetadataCache,
  ) {
    this.metadataCache = metadataCache ?? new CouponMetadataCache();
  }

  private async increaseRequestCount(): Promise<void> {
    await this.couponModel.increaseRequestCount();
  }

  private async getCouponMetadata(): Promise<CouponMetadata> {
    const cached = this.metadataCache.get();
    if (cached) return cached;

    const couponMetadata = await this.couponModel.getCouponMetadata();
    if (couponMetadata === null) {
      throw new BadRequestError(couponMessage.NOT_FOUND_COUPON_METADATA);
    }
    const parsed = JSON.parse(couponMetadata) as CouponMetadata;
    this.metadataCache.set(parsed);
    return parsed;
  }

  private checkCorrectTime(startTime: string, endTime: string): void {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    const result = now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
    if (!result) {
      throw new BadRequestError(couponMessage.NOT_CORRECT_TIME);
    }
  }

  private async getAlreadyIssuedQuantityAndIssue(
    userId: string,
  ): Promise<{ alreadyIssuedQuantity: number; issued: boolean }> {
    return this.couponModel.getAlreadyIssuedQuantityAndIssue(userId);
  }

  private async cancelIssuingAndThrowError(userId: string): Promise<void> {
    this.couponModel.cancelIssuing(userId).catch((error: unknown) => {
      this.logger.error('쿠폰 발급 취소 에러:', error);
    });
    throw new NotFoundError(couponMessage.NOT_ENOUGH_COUPON);
  }

  private async increaseIssuedCouponCount(): Promise<void> {
    await this.couponModel.increaseIssuedCouponCount();
  }

  async exec(requestIssueCoupon: RequestIssueCoupon): Promise<ResponseIssueCoupon> {
    this.increaseRequestCount().catch((error: unknown) => {
      this.logger.error('쿠폰 발급 요청 횟수 증가 에러:', error);
    });

    const { startTime, endTime, quantity } = await this.getCouponMetadata();

    this.checkCorrectTime(startTime, endTime);

    const { userId } = requestIssueCoupon;

    const { alreadyIssuedQuantity, issued } = await this.getAlreadyIssuedQuantityAndIssue(userId);

    if (alreadyIssuedQuantity >= quantity && issued) {
      await this.cancelIssuingAndThrowError(userId);
    }

    if (!issued) {
      throw new BadRequestError(couponMessage.USER_HAS_ALREADY_RECEIVED_THE_COUPON);
    }

    this.increaseIssuedCouponCount().catch((error: unknown) => {
      this.logger.error('쿠폰 발급 개수 증가 에러:', error);
    });

    return {
      issued: true,
    };
  }
}

export default IssueCouponService;
