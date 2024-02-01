import { Request, Response } from 'express';
import IndexService from '../services/IndexService';
import customResponse from '../middlewares/customResponse';

export default class IndexController {
  async getIndex(_request: Request, response: Response) {
    const indexService = new IndexService();
    return indexService
      .exec()
      .then(customResponse.respondWithOK(response))
      .catch(customResponse.handleError(response));
  }
}
