import {
  BaseHttpError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
  ServiceUnavailableError,
  RequiredError,
  DataTypeError,
  EnumerationError,
  UniqueError,
} from '../../utils/customErrors';

describe('customErrors', () => {
  describe('BaseHttpError', () => {
    it('status, code, message를 올바르게 설정한다', () => {
      const error = new BaseHttpError(400, { message: '에러 메시지', code: 'ERR001' });
      expect(error.status).toBe(400);
      expect(error.code).toBe('ERR001');
      expect(error.message).toBe('에러 메시지');
      expect(error.name).toBe('BaseHttpError');
    });

    it('string 메시지를 처리한다', () => {
      const error = new BaseHttpError(500, '문자열 에러');
      expect(error.message).toBe('문자열 에러');
      expect(error.code).toBe('');
    });

    it('getOutputData가 올바른 형태를 반환한다', () => {
      const error = new BaseHttpError(404, { message: '없음', code: 'ERR404' }, undefined, {
        id: 1,
      });
      const output = error.getOutputData();
      expect(output).toEqual({
        status: 404,
        name: 'BaseHttpError',
        message: '없음',
        errorCode: 'ERR404',
        data: { id: 1 },
      });
    });

    it('messageArgs로 메시지를 포맷팅한다', () => {
      const error = new BaseHttpError(
        400,
        { message: '{field} 오류', code: 'ERR' },
        { field: '이름' },
      );
      expect(error.message).toBe('이름 오류');
    });

    it('string messageArgs로 PATH를 치환한다', () => {
      const error = new BaseHttpError(400, { message: '{PATH} 필수', code: 'ERR' }, 'userId');
      expect(error.message).toBe('userId 필수');
    });
  });

  describe('서브클래스 instanceof 체크', () => {
    it('BadRequestError는 BaseHttpError의 인스턴스', () => {
      const error = new BadRequestError({ message: '잘못된 요청', code: 'ERR400' });
      expect(error).toBeInstanceOf(BaseHttpError);
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error).toBeInstanceOf(Error);
      expect(error.status).toBe(400);
      expect(error.name).toBe('BadRequestError');
    });

    it('NotFoundError는 status 404', () => {
      const error = new NotFoundError({ message: '찾을 수 없음', code: 'ERR404' });
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.status).toBe(404);
    });

    it('UnauthorizedError는 status 401', () => {
      const error = new UnauthorizedError('인증 필요');
      expect(error.status).toBe(401);
    });

    it('ForbiddenError는 status 403', () => {
      const error = new ForbiddenError('접근 금지');
      expect(error.status).toBe(403);
    });

    it('ConflictError는 status 409', () => {
      const error = new ConflictError('충돌');
      expect(error.status).toBe(409);
    });

    it('InternalServerError는 status 500', () => {
      const error = new InternalServerError({ message: '서버 에러', code: 'ERR500' });
      expect(error.status).toBe(500);
    });

    it('ServiceUnavailableError는 status 503', () => {
      const error = new ServiceUnavailableError({ message: '서비스 불가', code: 'ERR503' });
      expect(error.status).toBe(503);
    });

    it('RequiredError는 status 400', () => {
      const error = new RequiredError('필수값 누락');
      expect(error.status).toBe(400);
      expect(error.name).toBe('RequiredError');
    });

    it('DataTypeError는 status 400', () => {
      const error = new DataTypeError('타입 오류');
      expect(error.status).toBe(400);
    });

    it('EnumerationError는 status 400', () => {
      const error = new EnumerationError('열거값 오류');
      expect(error.status).toBe(400);
    });

    it('UniqueError는 status 400', () => {
      const error = new UniqueError('유니크 위반');
      expect(error.status).toBe(400);
    });
  });

  describe('에러 구분', () => {
    it('BadRequestError와 NotFoundError는 서로 다른 타입', () => {
      const badReq = new BadRequestError('잘못된 요청');
      const notFound = new NotFoundError('찾을 수 없음');
      expect(badReq).not.toBeInstanceOf(NotFoundError);
      expect(notFound).not.toBeInstanceOf(BadRequestError);
    });
  });
});
