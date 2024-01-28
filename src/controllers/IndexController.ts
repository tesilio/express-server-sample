import { Request, Response } from 'express';

export default class IndexController {
  async getIndex(_req: Request, res: Response) {
    try {
      res.status(200).json({
        message: 'Hello World',
      });
    } catch (error) {
      const { message } = error as any;
      res.status(500).json({ message: message ?? '알 수 없는 에러가 발생했습니다.' });
    }
  }
}
