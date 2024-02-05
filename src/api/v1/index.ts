import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import IndexServiceService from '../../services/IndexService';
import customResponse from '../../utils/customResponse';

/**
 * 인덱스 라우터 설정
 * @param {e.Router} app
 */
export default (app: Router) => {
  app.use('/v1', app);

  /**
   * Home, Hello World!
   */
  app.get('/', async (_request: Request, response: Response, _next: NextFunction) => {
    const indexServiceInstance = Container.get(IndexServiceService);
    return indexServiceInstance
      .helloWorld()
      .then(customResponse.respondWithOK(response))
      .catch(customResponse.handleError(response));
  });
};
