import { body } from 'express-validator';

export const couponIssueBodyValidator = [
  body('userId', 'zzzz').not().isEmpty(),
];
