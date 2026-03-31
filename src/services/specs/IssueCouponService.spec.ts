import IssueCouponService from '../IssueCouponService';
import CouponModel from '../../models/redis/CouponModel';
import { Logger } from 'winston';
import { RequestIssueCoupon } from '../../types';
import { BadRequestError, NotFoundError } from '../../utils/customErrors';
import couponMessage from '../../messages/coupon.message';

describe('IssueCouponService 테스트', () => {
  let issueCouponService: IssueCouponService;
  let mockCouponModel: jest.Mocked<
    Pick<
      CouponModel,
      | 'getAlreadyIssuedQuantityAndIssue'
      | 'getCouponMetadata'
      | 'cancelIssuing'
      | 'increaseRequestCount'
      | 'increaseIssuedCouponCount'
    >
  >;
  let mockLogger: Pick<Logger, 'error'>;

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
      cancelIssuing: jest.fn().mockResolvedValue(1),
      increaseRequestCount: jest.fn().mockResolvedValue(1),
      increaseIssuedCouponCount: jest.fn().mockResolvedValue(1),
    };
    mockLogger = {
      error: jest.fn(),
    };
    issueCouponService = new IssueCouponService(
      mockCouponModel as unknown as CouponModel,
      mockLogger as Logger,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('exec 테스트', () => {
    it('사용자가 쿠폰을 발급받는다.', async () => {
      const requestIssueCoupon: RequestIssueCoupon = { userId: 'test' };
      mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
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
      mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
        alreadyIssuedQuantity: 100,
        issued: true,
      });

      await expect(issueCouponService.exec(requestIssueCoupon)).rejects.toEqual(
        new NotFoundError(couponMessage.NOT_ENOUGH_COUPON),
      );
    });

    it('사용자가 이미 쿠폰을 발급 받았다면 BadRequestError 에러가 발생한다.', async () => {
      const requestIssueCoupon: RequestIssueCoupon = { userId: 'test' };
      mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
        alreadyIssuedQuantity: 1,
        issued: false,
      });

      await expect(issueCouponService.exec(requestIssueCoupon)).rejects.toEqual(
        new BadRequestError(couponMessage.USER_HAS_ALREADY_RECEIVED_THE_COUPON),
      );
    });

    describe('메타데이터 조회', () => {
      it('메타데이터가 없으면 BadRequestError를 던진다', async () => {
        mockCouponModel.getCouponMetadata.mockResolvedValue(null);

        await expect(issueCouponService.exec({ userId: 'test' })).rejects.toEqual(
          new BadRequestError(couponMessage.NOT_FOUND_COUPON_METADATA),
        );
      });

      it('캐시 히트 시 Redis를 조회하지 않는다', async () => {
        mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
          alreadyIssuedQuantity: 0,
          issued: true,
        });

        await issueCouponService.exec({ userId: 'user1' });
        expect(mockCouponModel.getCouponMetadata).toHaveBeenCalledTimes(1);

        mockCouponModel.getCouponMetadata.mockClear();
        await issueCouponService.exec({ userId: 'user2' });
        expect(mockCouponModel.getCouponMetadata).not.toHaveBeenCalled();
      });
    });

    describe('시간 경계값', () => {
      const setupForSuccess = () => {
        mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
          alreadyIssuedQuantity: 0,
          issued: true,
        });
      };

      it('정확히 startTime이면 발급 성공한다', async () => {
        jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
        setupForSuccess();

        const result = await issueCouponService.exec({ userId: 'test' });
        expect(result).toEqual({ issued: true });
      });

      it('정확히 endTime이면 발급 성공한다', async () => {
        jest.setSystemTime(new Date('2024-12-31T23:59:59.999Z'));
        setupForSuccess();

        const result = await issueCouponService.exec({ userId: 'test' });
        expect(result).toEqual({ issued: true });
      });

      it('startTime 1ms 전이면 BadRequestError를 던진다', async () => {
        jest.setSystemTime(new Date('2023-12-31T23:59:59.999Z'));

        await expect(issueCouponService.exec({ userId: 'test' })).rejects.toEqual(
          new BadRequestError(couponMessage.NOT_CORRECT_TIME),
        );
      });

      it('endTime 1ms 후면 BadRequestError를 던진다', async () => {
        jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

        await expect(issueCouponService.exec({ userId: 'test' })).rejects.toEqual(
          new BadRequestError(couponMessage.NOT_CORRECT_TIME),
        );
      });
    });

    describe('수량 경계값', () => {
      it('마지막 1개 남았을 때(quantity - 1) 발급 성공한다', async () => {
        mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
          alreadyIssuedQuantity: 99,
          issued: true,
        });

        const result = await issueCouponService.exec({ userId: 'test' });
        expect(result).toEqual({ issued: true });
      });

      it('수량 초과이고 이미 발급받은 유저면 중복 발급 에러를 던진다', async () => {
        mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
          alreadyIssuedQuantity: 100,
          issued: false,
        });

        await expect(issueCouponService.exec({ userId: 'test' })).rejects.toEqual(
          new BadRequestError(couponMessage.USER_HAS_ALREADY_RECEIVED_THE_COUPON),
        );
      });
    });

    describe('fire-and-forget 에러 격리', () => {
      it('increaseRequestCount 실패해도 정상 동작한다', async () => {
        const error = new Error('Redis error');
        mockCouponModel.increaseRequestCount.mockRejectedValue(error);
        mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
          alreadyIssuedQuantity: 0,
          issued: true,
        });

        const result = await issueCouponService.exec({ userId: 'test' });
        expect(result).toEqual({ issued: true });
        expect(mockLogger.error).toHaveBeenCalledWith('쿠폰 발급 요청 횟수 증가 에러:', error);
      });

      it('increaseIssuedCouponCount 실패해도 성공을 반환한다', async () => {
        const error = new Error('Redis error');
        mockCouponModel.increaseIssuedCouponCount.mockRejectedValue(error);
        mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
          alreadyIssuedQuantity: 0,
          issued: true,
        });

        const result = await issueCouponService.exec({ userId: 'test' });
        expect(result).toEqual({ issued: true });

        await Promise.resolve();
        expect(mockLogger.error).toHaveBeenCalledWith('쿠폰 발급 개수 증가 에러:', error);
      });

      it('cancelIssuing 실패해도 NotFoundError를 던진다', async () => {
        const cancelError = new Error('Redis error');
        mockCouponModel.cancelIssuing.mockRejectedValue(cancelError);
        mockCouponModel.getAlreadyIssuedQuantityAndIssue.mockResolvedValue({
          alreadyIssuedQuantity: 100,
          issued: true,
        });

        await expect(issueCouponService.exec({ userId: 'test' })).rejects.toEqual(
          new NotFoundError(couponMessage.NOT_ENOUGH_COUPON),
        );

        await Promise.resolve();
        expect(mockLogger.error).toHaveBeenCalledWith('쿠폰 발급 취소 에러:', cancelError);
      });
    });
  });
});
