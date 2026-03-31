import { Router, Request, Response, NextFunction } from 'express';
import IndexService from '../../../services/IndexService';
import customResponse from '../../../utils/customResponse';

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
