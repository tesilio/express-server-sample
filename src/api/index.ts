import { Router } from 'express';
import v1Index from './v1/index';
import v1Coupons from './v1/coupons';

const app = Router();
/**
 * 라우터
 * @returns {Router}
 */
export default (): Router => {
  v1Index(app);
  v1Coupons(app);
  return app;
};
