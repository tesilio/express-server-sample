import IssueCouponService from '../IssueCouponService';
import CouponModel from '../../models/redis/CouponModel';
import { Logger } from 'winston';
import { RequestIssueCoupon } from '@types';
import { BadRequestError, NotFoundError } from '../../utils/customErrors';
import couponMessage from '../../messages/coupon.message';

describe('IssueCouponService 테스트', () => {
  let issueCouponService: IssueCouponService;
  let mockCouponModel: Partial<CouponModel>;
  let mockLogger: Partial<Logger>;

  beforeEach(() => {
    const fakeDate = new Date(2024, 0, 1, 9, 0);
    jest.useFakeTimers().setSystemTime(fakeDate);
    mockCouponModel = {
      getAlreadyIssuedQuantityAndIssue: jest.fn(),
      getCouponMetadata: jest
        .fn()
        .mockResolvedValue(
          '{"startTime":"2024-01-01T00:00:00.000Z","endTime":"2024-12-31T23:59:59.999Z","quantity":100}',
        ),
      cancelIssuing: jest.fn().mockResolvedValue(true),
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

    it('쿠폰 발급 시간이 아니라면 BadRequestError 에러가 발생한다.', async () => {
      const requestIssueCoupon: RequestIssueCoupon = { userId: 'test' };
      const fakeDate = new Date(2023, 9, 21, 16, 57);
      jest.useFakeTimers().setSystemTime(fakeDate);

      await expect(issueCouponService.exec(requestIssueCoupon)).rejects.toEqual(
        new BadRequestError(couponMessage.NOT_CORRECT_TIME),
      );
    });

    it('쿠폰이 모두 소진되었다면 NotFoundError 에러가 발생한다.', async () => {
      const requestIssueCoupon: RequestIssueCoupon = { userId: 'test' };
      mockCouponModel.getAlreadyIssuedQuantityAndIssue = jest.fn().mockResolvedValue({
        alreadyIssuedQuantity: 100,
        issued: true,
      });

      await expect(issueCouponService.exec(requestIssueCoupon)).rejects.toEqual(
        new NotFoundError(couponMessage.NOT_ENOUGH_COUPON),
      );
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
