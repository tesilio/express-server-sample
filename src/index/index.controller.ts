import { Request, Response } from 'express';
import indexService from './index.service';
import customResponse from '../middlewares/customResponse';

export class IndexController {
  async getIndex(_request: Request, response: Response) {
    return indexService
      .exec()
      .then(customResponse.respondWithOK(response))
      .catch(customResponse.handleError(response));
  }
}

export default new IndexController();
