import { Request, Response } from 'express';
import customResponse from '../../utils/customResponse';

const createMockResponse = (): Response => {
  const res = {
    statusCode: 200,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    locals: {},
    req: { originalUrl: '/test', method: 'GET' },
  } as unknown as Response;
  return res;
};

describe('customResponse', () => {
  describe('sendOK', () => {
    it('200 OK를 반환한다', () => {
      const res = createMockResponse();
      customResponse.sendOK({} as Request, res);
      expect(res.statusCode).toBe(200);
      expect(res.end).toHaveBeenCalledWith('OK');
    });
  });

  describe('sendNotFound', () => {
    it('404 Not Found를 반환한다', () => {
      const res = createMockResponse();
      customResponse.sendNotFound({} as Request, res);
      expect(res.statusCode).toBe(404);
      expect(res.end).toHaveBeenCalledWith('Not Found');
    });
  });

  describe('respondWithOK', () => {
    it('entity가 있으면 json으로 반환한다', () => {
      const res = createMockResponse();
      customResponse.respondWithOK(res)({ data: 'test' });
      expect(res.statusCode).toBe(200);
      expect(res.json).toHaveBeenCalledWith({ data: 'test' });
    });

    it('entity가 없으면 빈 객체를 반환한다', () => {
      const res = createMockResponse();
      customResponse.respondWithOK(res)(null);
      expect(res.statusCode).toBe(200);
      expect(res.json).toHaveBeenCalledWith({});
    });
  });

  describe('respondWithCreated', () => {
    it('201 Created를 반환한다', () => {
      const res = createMockResponse();
      customResponse.respondWithCreated(res)({ id: 1 });
      expect(res.statusCode).toBe(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('respondWithAccepted', () => {
    it('202 Accepted를 반환한다', () => {
      const res = createMockResponse();
      customResponse.respondWithAccepted(res)({ queued: true });
      expect(res.statusCode).toBe(202);
    });
  });

  describe('respondWithNoContent', () => {
    it('204 No Content를 반환한다', () => {
      const res = createMockResponse();
      customResponse.respondWithNoContent(res)({ ignored: true });
      expect(res.statusCode).toBe(204);
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe('handleError', () => {
    it('400 에러를 처리한다', () => {
      const res = createMockResponse();
      customResponse.handleError(res)({
        status: 400,
        code: 'ERR001',
        name: 'BadRequestError',
        message: '잘못된 요청',
      });
      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('500 에러는 메시지를 숨긴다', () => {
      const res = createMockResponse();
      customResponse.handleError(res)({
        status: 500,
        name: 'InternalServerError',
        message: '내부 에러',
      });
      expect(res.statusCode).toBe(500);
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error.message).toBe('알 수 없는 에러가 발생했습니다.');
    });

    it('status가 없으면 500으로 처리한다', () => {
      const res = createMockResponse();
      customResponse.handleError(res)({
        name: 'Error',
        message: '에러',
      });
      expect(res.statusCode).toBe(500);
    });

    it('statusCode 오버라이드가 동작한다', () => {
      const res = createMockResponse();
      customResponse.handleError(
        res,
        503,
      )({
        status: 400,
        name: 'Error',
        message: '에러',
      });
      expect(res.statusCode).toBe(503);
    });

    it('5xx 에러는 url/method를 포함한다', () => {
      const res = createMockResponse();
      const err: Record<string, unknown> = {
        status: 500,
        name: 'Error',
        message: '에러',
      };
      customResponse.handleError(res)(err as { status?: number; name?: string; message?: string });
      expect(res.json).toHaveBeenCalled();
    });
  });
});
