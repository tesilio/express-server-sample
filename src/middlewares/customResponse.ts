/**
 * HTTP 응답은 JSON 타입의 데이터를 전달하는 것을 기본으로 한다.
 *
 * 사용되는 HTTP Status
 *  - 200 OK                      : 일반적인 요청 성공
 *  - 201 Created                 : 성공적인 리소스 생성(보통 POST)
 *  - 202 Accepted                : 비동기 처리가 성공적으로 시작된 경우
 *  - 204 No Content              : 응답 바디에 의도적으로 아무것도 포함되지 않음(보통 PUT, DELETE)
 *  - 301 Moved Permanently       : 리소스 모델이 재설계되어 요청 경로가 변경됨
 *  - 304 Not Modified            : 클라이언트의 정보가 최신인 경우
 *  - 400 Bad Request             : 일반적인 요청 실패
 *  - 401 Unauthorized            : 인증되지 않음
 *  - 403 Forbidden               : 인증과 상관없이 액세스 금지
 *  - 404 Not Found               : 요청 URI에 해당하는 리소스가 없음
 *  - 409 Conflict                : 리소스 상태에 위반됨(e.g. 비어있지 않은 리소스에 대한 삭제 요청)
 *  - 422 Unprocessable Entity    : 전달된 데이터의 형태가 유효하지 않음 (deprecated) -> 400 Bad Request
 *  - 500 Internal Server Error   : 내부 서버 에러(API가 잘못 작동할 때)
 *  - 503 Service Unavailable     : 외부 서비스가 멈춘상태
 *
 * 에러 발생시 응답 본문
 * {
 *   "error": {
 *     "status": {number} HTTP 스테이터스,
 *     "name": {string} 에러명,
 *     "message": {string} 에러 메세지,
 *     "alertMessage": {string=} 출력할 에러 메세지
 *   }
 * }
 */
import _ from 'lodash';
import { Request, Response } from 'express';

import errorMessage from './error.message';
import { CustomErrorInterface, CustomError, UnauthorizedError } from './error';

/**
 * JSON 성공 응답
 *
 * @param {Object}res       - 익스프레스 응답 객체
 * @param {Number=} status  - 응답할 HTTP 상태코드
 * @returns {function}
 */
const respondSuccess = (res: Response, status: number): any => {
  /**
   * 성공처리 함수
   * @param {*} entity - 결과값
   * @returns {*}
   */
  return (entity: any): any => {
    res.statusCode = status;

    if (entity) {
      res.json(entity);
    } else {
      res.json({});
    }

    return entity;
  };
};

/**
 * JSON 에러 응답
 *
 * @param {Object}  res               - 익스프레스 응답 객체
 * @param {Error}   err               - 에러 객체
 * @param {String}  err.name          - 에러명
 * @param {Number}  err.status        - 응답할 HTTP 상태코드
 * @param {String}  err.message       - 에러 메세지
 * @param {String}  err.alertMessage  - 출력할 에러 메세지
 * @param {Object=} err.data          - 에러 데이터
 * @returns {*}
 */
const respondError = (res: Response, err: any): any => {
  const { code } = err;

  // 코드에 고려되지 않은 에러를 처리하기 위한 안내 문구 추가
  if (err.status >= 500) {
    err.message = errorMessage.UNKNOWN_ERROR.message;
  }

  const error = new CustomError(err);

  // @ts-ignore
  res.errorCode = code || undefined;
  res.statusCode = err.status;
  res.json({ error: error.getOutPutData() });
  return { error };
};

/**
 * 기본 에러 메세지 응답
 *
 * @param {Object}  res               - 익스프레스 응답 객체
 * @param {Error}   err               - 에러 객체
 * @param {String}  err.name          - 에러명
 * @param {Number=} err.status        - 응답할 HTTP 상태코드
 * @param {String=} err.message       - 에러 메세지
 * @param {String}  err.alertMessage  - 출력할 에러 메세지
 * @param {Number=} statusCode        - 응답할 HTTP 상태코드
 * @returns {*}
 */
const respondDefaultError = (res: Response, err: CustomErrorInterface, statusCode: number) => {
  if (statusCode) {
    err.status = statusCode;
  } else if (_.isNil(err.status)) {
    err.status = 500;
  }
  if (_.isNil(err.message)) {
    err.message = errorMessage.UNKNOWN_ERROR.message;
  }
  return respondError(res, err);
};

export default {
  /**
   * 200 OK 응답 함수
   *
   * @param {Object} _req - 익스프레스 요청 객체
   * @param {Object} res - 익스프레스 응답 객체
   */
  sendOK(_req: Request, res: Response) {
    res.statusCode = 200;
    res.end('OK');
  },

  /**
   * 404 Not Found 응답 함수
   *
   * @param {Object} _req - 익스프레스 요청 객체
   * @param {Object} res - 익스프레스 응답 객체
   */
  sendNotFound(_req: Request, res: Response) {
    res.statusCode = 404;
    res.end('Not Found');
  },

  /**
   * 요청한 데이터를 JSON 데이터로 전달
   *
   * @param {Object} res          - 익스프레스 응답 객체
   * @param {Number=} statusCode  - 응답할 HTTP 상태코드
   * @returns {function}
   * @deprecated
   */
  respondWithResult(res: Response, statusCode: number) {
    return respondSuccess(res, statusCode || 200);
  },

  /**
   * 200 OK 응답
   *
   * @param {Object} res - 익스프레스 응답 객체
   * @returns {Function}
   */
  respondWithOK(res: Response) {
    return respondSuccess(res, 200);
  },

  /**
   * 201 Created 응답
   *
   * @param {Object} res - 익스프레스 응답 객체
   * @returns {Function}
   */
  respondWithCreated(res: Response) {
    return respondSuccess(res, 201);
  },

  /**
   * 203 Accepted 응답
   *
   * @param {Object} res - 익스프레스 응답 객체
   * @returns {Function}
   */
  respondWithAccepted(res: Response) {
    return respondSuccess(res, 203);
  },

  /**
   * 성공하였으나 전달할 데이터 없음
   *
   * @param {Object} res - 익스프레스 응답 객체
   * @returns {function}
   */
  respondWithNoContent(res: Response) {
    /**
     * 204 처리 함수
     *
     * @param {*=} entity - 결과값
     * @returns {*}
     */
    return (entity: any): any => {
      res.statusCode = 204;
      res.end();
      return entity;
    };
  },

  /**
   * 실패 메세지를 JSON 형태로 응답
   *
   * @param {Object}  res         - 익스프레스 응답 객체
   * @param {Number=} statusCode  - 응답할 HTTP 상태코드
   * @returns {function}
   */
  handleError(res: Response, statusCode?: number) {
    /**
     * 에러처리 함수
     *
     * @param {CustomErrorInterface} err - 에러 객체
     * @returns {Error}
     */
    return (err: CustomErrorInterface): Error => {
      console.log(err);
      // case: 400 ~ 499
      if (!_.inRange(err.status, 400, 499)) {
        err.url = _.get(res, 'req.originalUrl');
        err.method = _.get(res, 'req.method');
      }
      switch (err.name) {
        default:
          return respondDefaultError(res, err, statusCode || 500);
      }
    };
  },
};
