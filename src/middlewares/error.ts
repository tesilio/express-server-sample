import _ from 'lodash';
import format from 'string-template';

interface Message {
  code: string;
  message: string;
  status?: number;
  name?: string;
  fieldName?: any;
}

interface CustomErrorInterface {
  status: number;
  code: any;
  name: string;
  message: string;
  data: any;
  url: string;
  method: string;
  stack: any;
}

class CustomError {
  public status: number;

  public code: any;

  public name: string;

  public message: string;

  public data: any;

  public url: string;

  public method: string;

  public stack: any;

  constructor(error: CustomErrorInterface) {
    this.status = error.status;
    this.code = error.code;
    this.name = error.name;
    this.message = error.message;
    this.data = error.data;
    this.url = error.url;
    this.method = error.method;
    this.stack = error.stack;
  }

  public getOutPutData = () => {
    return {
      status: this.status,
      name: this.name,
      message: this.message,
      errorCode: this.code,
      data: this.data,
    };
  };
}


/**
 * 데이터 형태 에러 메세지 조합
 * @param {String}            message     - 에러 메세지
 * @param {(String|Object)=}  messageArgs - 에러가 발생한 필드명
 * @returns {String}  - 필드명을 가공한 메세지
 */
const formatMessage = (message: string, messageArgs: any): string => {
  if (!messageArgs) {
    return message;
  }
  if (_.isObject(messageArgs)) {
    return format(message, messageArgs);
  }
  return message.replace(/\{PATH}/g, messageArgs);
};

/**
 * 메세지 데이터 추출
 *
 * @param {String|Object}     message     - Error Message
 * @param {(String|Object)=}  messageArgs   - 메세지 변수 데이터
 * @returns {String}
 */
const getMessage = (message: Message | string, messageArgs: any): string => {
  let msg;
  if (_.isObject(message)) {
    msg = message.message;
    if (!messageArgs) {
      messageArgs = message.fieldName;
    }
  } else {
    msg = message;
  }
  return formatMessage(msg, messageArgs);
};

/**
 * 일반적인 요청 실패 에러
 */
class BadRequestError extends Error {
  public code: string;
  public status: number;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message | string, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    let msg: Message = message as Message;

    if (_.isString(message) === true) {
      msg = { message } as Message;
    }

    this.name = this.constructor.name;
    this.status = 400;
    this.code = msg.code;
    this.data = data;
  }
}

/**
 * 필수값 에러
 * - 필수값이 누락된 경우
 */
class RequiredError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String}            message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message | string, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    let msg: Message = message as Message;

    if (_.isString(message) === true) {
      msg = { message } as Message;
    }
    this.name = this.constructor.name;
    this.status = 400;
    this.code = msg.code;
    this.data = data;
  }
}

/**
 * 데이터 타입 에러
 * - 정해진 타입이 아닌 경우
 */
class DataTypeError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message | string, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    let msg: Message = message as Message;

    if (_.isString(message) === true) {
      msg = { message } as Message;
    }

    this.name = this.constructor.name;
    this.status = 400;
    this.code = msg.code;
    this.data = data;
  }
}

/**
 * 이뉴머레이션 밸류 에러
 * - 전달된 값이 주어진 enum 값이 아닐 경우
 */
class EnumerationError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message | string, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    let msg: Message = message as Message;

    if (_.isString(message) === true) {
      msg = { message } as Message;
    }

    this.name = this.constructor.name;
    this.status = 400;
    this.code = msg.code;
    this.data = data;
  }
}

/**
 * 유니크 에러
 * - 유니크 조건을 만족시키지 못하는 경우
 */
class UniqueError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message | string, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    let msg: Message = message as Message;

    if (_.isString(message) === true) {
      msg = { message } as Message;
    }

    this.name = this.constructor.name;
    this.status = 400;
    this.code = msg.code;
    this.data = data;
  }
}

/**
 * 인증 에러
 */
class UnauthorizedError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message | string, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    let msg: Message = message as Message;

    if (_.isString(message) === true) {
      msg = { message } as Message;
    }

    this.name = this.constructor.name;
    this.status = 401;
    this.code = msg.code;
    this.data = data;
  }
}

/**
 * 인증과 상관없는 액세스 금지 에러
 */
class ForbiddenError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message | string, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    let msg: Message = message as Message;

    if (_.isString(message) === true) {
      msg = { message } as Message;
    }

    this.name = this.constructor.name;
    this.status = 403;
    this.code = msg.code;
    this.data = data;
  }
}

/**
 * 데이터를 찾을 수 없을 경우의 에러
 */
class NotFoundError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message | string, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    let msg: Message = message as Message;

    if (_.isString(message) === true) {
      msg = { message } as Message;
    }

    this.name = this.constructor.name;
    this.status = 404;
    this.code = msg.code;
    this.data = data;
  }
}

/**
 * 리소스 상태에 위반됨 에러
 */
class ConflictError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message | string, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    let msg: Message = message as Message;

    if (_.isString(message) === true) {
      msg = { message } as Message;
    }

    this.name = this.constructor.name;
    this.status = 409;
    this.code = msg.code;
    this.data = data;
  }
}

/**
 * 내부 서버 에러
 */
class InternalServerError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message     - Error Message
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    this.name = this.constructor.name;
    this.status = 500;
    this.code = message.code;
    this.data = data;
  }
}

/**
 * 외부 서비스를 사용할 수 없는 에러
 */
class ServiceUnavailableError extends Error {
  public status: number;
  public code: string;
  public data: any;

  /**
   * Constructor
   * @param {String|Object}     message       - Error Message
   * @param {String=}           message.alert - 메시지 알림
   * @param {String=}           message.code  - 메시지 오류 코드
   * @param {(Object|String)=}  messageArgs - Error Message Args
   * @param {Object=}           data        - Error Data
   */
  constructor(message: Message, messageArgs?: any, data?: any) {
    super(getMessage(message, messageArgs));

    this.name = this.constructor.name;
    this.status = 503;
    this.code = message.code;
    this.data = data;
  }
}

export {
  CustomErrorInterface,
  CustomError,
  BadRequestError,
  RequiredError,
  DataTypeError,
  EnumerationError,
  UniqueError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  ServiceUnavailableError,
};
