import { Router, Request, Response, NextFunction } from 'express';
import IndexService from '../../../services/IndexService';
import customResponse from '../../../utils/customResponse';

/**
 * @swagger
 * /v1/:
 *   get:
 *     summary: Hello World
 *     description: 서버 동작 확인용 Hello World 엔드포인트
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello World!
 */
const createIndexRouter = (indexService: IndexService): Router => {
  const router = Router();

  router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
    try {
      const result = await indexService.helloWorld();
      customResponse.respondWithOK(res)(result);
    } catch (err) {
      customResponse.handleError(res)(
        err as { status?: number; code?: string; name?: string; message?: string },
      );
    }
  });

  return router;
};

export default createIndexRouter;
