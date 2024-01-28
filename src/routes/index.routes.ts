import { Router } from 'express';
import IndexController from '../controllers/IndexController';

const indexController = new IndexController();

/**
 * 인덱스 라우터
 */
class IndexRoutes {
  /**
   * 라우터
   * @type {Router}
   */
  router: Router = Router();

  /**
   * 생성자
   */
  constructor() {
    this.initializeRoutes();
  }

  /**
   * 라우터 초기화
   * @private
   */
  private initializeRoutes() {
    this.router.get('/', indexController.getIndex);
  }
}

/**
 * 인덱스 라우터 인스턴스
 */
export default new IndexRoutes().router;
