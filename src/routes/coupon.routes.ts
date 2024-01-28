import { Router } from 'express';
import CouponController from '../controllers/CouponController';

const couponController = new CouponController();

/**
 * 쿠폰 라우터
 */
class CouponRoutes {
  /**
   * 라우터
   * @type {e.Router}
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
    this.router.post('/issue', couponController.issueCoupon);
  }
}

/**
 * 쿠폰 라우터 인스턴스
 */
export default new CouponRoutes().router;
