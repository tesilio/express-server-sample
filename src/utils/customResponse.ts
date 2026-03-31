import { Request, Response } from 'express';
import errorMessage from '../messages/error.message';
import { BaseHttpError } from './customErrors';

interface ErrorLike {
  status?: number;
  code?: string;
  name?: string;
  message?: string;
  data?: unknown;
}

interface CustomResponseLocals {
  errorCode?: string;
}

const respondSuccess = (res: Response, status: number) => {
  return (entity: unknown): unknown => {
    res.statusCode = status;
    if (entity) {
      res.json(entity);
    } else {
      res.json({});
    }
    return entity;
  };
};

const respondError = (res: Response<unknown, CustomResponseLocals>, err: ErrorLike) => {
  const status = err.status ?? 500;

  if (status >= 500) {
    err.message = errorMessage.UNKNOWN_ERROR.message;
  }

  const error = new BaseHttpError(status, err.message ?? errorMessage.UNKNOWN_ERROR.message);
  error.code = err.code ?? '';
  error.data = err.data;
  error.name = err.name ?? 'Error';

  res.locals.errorCode = err.code ?? undefined;
  res.statusCode = status;
  res.json({ error: error.getOutputData() });
  return { error };
};

export default {
  sendOK(_req: Request, res: Response) {
    res.statusCode = 200;
    res.end('OK');
  },

  sendNotFound(_req: Request, res: Response) {
    res.statusCode = 404;
    res.end('Not Found');
  },

  respondWithOK(res: Response) {
    return respondSuccess(res, 200);
  },

  respondWithCreated(res: Response) {
    return respondSuccess(res, 201);
  },

  respondWithAccepted(res: Response) {
    return respondSuccess(res, 202);
  },

  respondWithNoContent(res: Response) {
    return (entity: unknown): unknown => {
      res.statusCode = 204;
      res.end();
      return entity;
    };
  },

  handleError(res: Response<unknown, CustomResponseLocals>, statusCode?: number) {
    return (err: ErrorLike): { error: BaseHttpError } => {
      const errStatus = err.status ?? 500;
      if (errStatus < 400 || errStatus >= 500) {
        const req = res.req;
        if (req) {
          (err as ErrorLike & { url?: string; method?: string }).url = req.originalUrl;
          (err as ErrorLike & { url?: string; method?: string }).method = req.method;
        }
      }
      return respondError(res, { ...err, status: statusCode ?? errStatus });
    };
  },
};
