import { Router, Request, Response, NextFunction } from 'express';
import customResponse from '../../../utils/customResponse';
import IssueCouponService from '../../../services/IssueCouponService';
import { validateCouponIssueBody } from './validator';

const createCouponRouter = (issueCouponService: IssueCouponService): Router => {
  const router = Router();

  router.post(
    '/issues',
    validateCouponIssueBody,
    async (_req: Request, res: Response, _next: NextFunction) => {
      try {
        const result = await issueCouponService.exec(_req.body);
        customResponse.respondWithOK(res)(result);
      } catch (err) {
        customResponse.handleError(res)(
          err as { status?: number; code?: string; name?: string; message?: string },
        );
      }
    },
  );

  return router;
};

export default createCouponRouter;
