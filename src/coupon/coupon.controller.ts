import { Request, Response } from 'express';
import issueCouponService from './issueCoupon.service';
import customResponse from '../middlewares/customResponse';
import { ResponseIssueCoupon } from '@types';

export class CouponController {
  /**
   * 쿠폰 발급 API
   * @param {e.Request} request - 요청 객체
   * @param {e.Response} response - 응답 객체
   * @returns {Promise<void>}
   */
  async issueCoupon(request: Request, response: Response): Promise<ResponseIssueCoupon | Error> {
    const { body } = request;

    // todo: body validation

    return issueCouponService.exec(body)
      .then(customResponse.respondWithCreated(response))
      .catch(customResponse.handleError(response));
  }
}

export default new CouponController();
