import IssueCouponService from '../IssueCouponService';
import CouponModel from '../../models/redis/CouponModel';
import { Logger } from 'winston';
import { RequestIssueCoupon } from '@types';

describe('IssueCouponService 테스트', () => {
  let issueCouponService: IssueCouponService;
  let mockCouponModel: Partial<CouponModel>;
  let mockLogger: Partial<Logger>;

  beforeEach(() => {
    mockCouponModel = {};
    mockLogger = {
      error: jest.fn(),
    };
    issueCouponService = new IssueCouponService(
      mockCouponModel as CouponModel,
      mockLogger as Logger,
    );
  });

  describe('exec 테스트', () => {
    it('사용자가 이미 쿠폰을 발급 받았다면 에러가 발생한다.', async () => {
      const requestIssueCoupon: RequestIssueCoupon = { userId: 'test' };
      mockCouponModel.getAlreadyIssuedQuantityAndIssue = jest.fn().mockResolvedValue({
        alreadyIssuedQuantity: 1,
        issued: false,
      });

      await expect(issueCouponService.exec(requestIssueCoupon)).rejects.toThrow();
    });
  });
});
