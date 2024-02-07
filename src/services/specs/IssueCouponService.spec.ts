import IssueCouponService from '../IssueCouponService';
import CouponModel from '../../models/redis/CouponModel';
import { Logger } from 'winston';
import { RequestIssueCoupon } from '@types';
import { BadRequestError } from '../../utils/customErrors';
import couponMessage from '../../messages/coupon.message';

describe('IssueCouponService 테스트', () => {
  let issueCouponService: IssueCouponService;
  let mockCouponModel: Partial<CouponModel>;
  let mockLogger: Partial<Logger>;

  beforeEach(() => {
    mockCouponModel = {
      getAlreadyIssuedQuantityAndIssue: jest.fn(),
      getCouponMetadata: jest
        .fn()
        .mockResolvedValue(
          '{"startTime":"2024-01-01T00:00:00.000Z","endTime":"2024-12-31T23:59:59.999Z","quantity":100}',
        ),
    };
    mockLogger = {
      error: jest.fn(),
    };
    issueCouponService = new IssueCouponService(
      mockCouponModel as CouponModel,
      mockLogger as Logger,
    );
  });

  describe('exec 테스트', () => {
    it('사용자가 쿠폰을 발급받는다.', async () => {
      const requestIssueCoupon: RequestIssueCoupon = { userId: 'test' };
      mockCouponModel.getAlreadyIssuedQuantityAndIssue = jest.fn().mockResolvedValue({
        alreadyIssuedQuantity: 0,
        issued: true,
      });

      const result = await issueCouponService.exec(requestIssueCoupon);
      expect(result).toEqual({ issued: true });
    });

    it('사용자가 이미 쿠폰을 발급 받았다면 BadRequestError 에러가 발생한다.', async () => {
      const requestIssueCoupon: RequestIssueCoupon = { userId: 'test' };
      mockCouponModel.getAlreadyIssuedQuantityAndIssue = jest.fn().mockResolvedValue({
        alreadyIssuedQuantity: 1,
        issued: false,
      });

      await expect(issueCouponService.exec(requestIssueCoupon)).rejects.toEqual(
        new BadRequestError(couponMessage.USER_HAS_ALREADY_RECEIVED_THE_COUPON),
      );
    });
  });
});
