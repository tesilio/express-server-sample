import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const couponIssueBodySchema = z.object({
  userId: z.string().min(1, '사용자 ID는 필수 입력값입니다.'),
});

export const validateCouponIssueBody = (req: Request, res: Response, next: NextFunction): void => {
  const result = couponIssueBodySchema.safeParse(req.body);
  if (!result.success) {
    const firstError = result.error.errors[0];
    res.status(400).json({
      error: {
        status: 400,
        name: 'BadRequestError',
        message: firstError.message,
        errorCode: 'ERR000006',
        data: result.error.errors,
      },
    });
    return;
  }
  next();
};
