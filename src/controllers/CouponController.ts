import { Request, Response } from 'express';
import IssueCouponService from '../services/IssueCouponService';

export default class CouponController {
  /**
   * 쿠폰 발급 API
   * @param {e.Request} req - 요청 객체
   * @param {e.Response} res - 응답 객체
   * @returns {Promise<void>}
   */
  async issueCoupon(req: Request, res: Response) {
    const issueCouponService = new IssueCouponService();
    try {
      const result = await issueCouponService.exec(req.body);
      res.status(201).json(result);
    } catch (error) {
      const { message } = error as any;
      res.status(500).json({ message: message ?? '알 수 없는 에러가 발생했습니다.' });
    }
  }
}
