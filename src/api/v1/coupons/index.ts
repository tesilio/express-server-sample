import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import customResponse from '../../../utils/customResponse';
import IssueCouponService from '../../../services/IssueCouponService';
import { couponIssueBodyValidator } from './validator';
import { validationResult } from 'express-validator';

/**
 * 쿠폰 라우터 설정
 * @param {e.Router} app
 */
export default (app: Router) => {
  app.use('/v1/coupons', app);

  /**
   * 쿠폰 발급
   */
  app.post(
    '/issues',
    couponIssueBodyValidator,
    async (request: Request, response: Response, _next: NextFunction) => {
      const validateErrors = validationResult(request);
      const issueCouponService = Container.get(IssueCouponService);
      return issueCouponService
        .exec(request.body)
        .then(customResponse.respondWithOK(response))
        .catch(customResponse.handleError(response));
    },
  );
};
