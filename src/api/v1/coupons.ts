import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import customResponse from '../../utils/customResponse';
import IssueCouponService from '../../services/IssueCouponService';

/**
 * 쿠폰 라우터 설정
 * @param {e.Router} app
 */
export default (app: Router) => {
  app.use('/v1/coupons', app);

  /**
   * 쿠폰 발급
   */
  app.post('/issues', async (request: Request, response: Response, _next: NextFunction) => {
    const issueCouponService = Container.get(IssueCouponService);
    return issueCouponService
      .exec(request.body) // todo: validate
      .then(customResponse.respondWithOK(response))
      .catch(customResponse.handleError(response));
  });
};
