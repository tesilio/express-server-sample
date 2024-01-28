import { Request, Response } from 'express';
import IssueCouponService from '../services/IssueCouponService';
import customResponse from '../middlewares/customResponse';

export default class CouponController {
  /**
   * 쿠폰 발급 API
   * @param {e.Request} req - 요청 객체
   * @param {e.Response} res - 응답 객체
   * @returns {Promise<void>}
   */
  async issueCoupon(req: Request, res: Response): Promise<boolean | Error> {
    const issueCouponService = new IssueCouponService();

    const { body } = req;

    return issueCouponService.exec(body)
      .then(customResponse.respondWithCreated(res))
      .catch(customResponse.handleError(res));
  }
}
