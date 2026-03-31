import { Router, Request, Response, NextFunction } from 'express';
import customResponse from '../../../utils/customResponse';
import IssueCouponService from '../../../services/IssueCouponService';
import { validateCouponIssueBody } from './validator';

/**
 * @swagger
 * /v1/coupons/issues:
 *   post:
 *     summary: 선착순 쿠폰 발급
 *     description: Redis 원자적 연산 기반 선착순 쿠폰 발급. 중복 발급 방지 및 수량 제한 포함.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 사용자 고유 ID
 *                 example: user-123
 *     responses:
 *       200:
 *         description: 쿠폰 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issued:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 잘못된 요청 (유효성 검증 실패, 발급 시간 아님, 이미 발급받음)
 *       404:
 *         description: 쿠폰 소진
 *       429:
 *         description: 요청 제한 초과
 */
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
