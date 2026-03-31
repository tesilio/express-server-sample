interface MessageDescriptor {
  code: string;
  message: string;
  status?: number;
  name?: string;
  fieldName?: string | Record<string, string>;
}

const formatMessage = (message: string, messageArgs?: string | Record<string, string>): string => {
  if (!messageArgs) {
    return message;
  }
  if (typeof messageArgs === 'object') {
    return Object.entries(messageArgs).reduce(
      (msg, [key, value]) => msg.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
      message,
    );
  }
  return message.replace(/\{PATH}/g, messageArgs);
};

const resolveMessage = (
  message: MessageDescriptor | string,
  messageArgs?: string | Record<string, string>,
): { msg: string; code: string } => {
  if (typeof message === 'object') {
    const args = messageArgs ?? message.fieldName;
    return { msg: formatMessage(message.message, args), code: message.code };
  }
  return { msg: formatMessage(message, messageArgs), code: '' };
};

class BaseHttpError extends Error {
  public status: number;
  public code: string;
  public data: unknown;

  constructor(
    status: number,
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    const { msg, code } = resolveMessage(message, messageArgs);
    super(msg);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.data = data;
  }

  public getOutputData = () => ({
    status: this.status,
    name: this.name,
    message: this.message,
    errorCode: this.code,
    data: this.data,
  });
}

class BadRequestError extends BaseHttpError {
  constructor(
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(400, message, messageArgs, data);
  }
}

class RequiredError extends BaseHttpError {
  constructor(
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(400, message, messageArgs, data);
  }
}

class DataTypeError extends BaseHttpError {
  constructor(
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(400, message, messageArgs, data);
  }
}

class EnumerationError extends BaseHttpError {
  constructor(
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(400, message, messageArgs, data);
  }
}

class UniqueError extends BaseHttpError {
  constructor(
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(400, message, messageArgs, data);
  }
}

class UnauthorizedError extends BaseHttpError {
  constructor(
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(401, message, messageArgs, data);
  }
}

class ForbiddenError extends BaseHttpError {
  constructor(
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(403, message, messageArgs, data);
  }
}

class NotFoundError extends BaseHttpError {
  constructor(
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(404, message, messageArgs, data);
  }
}

class ConflictError extends BaseHttpError {
  constructor(
    message: MessageDescriptor | string,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(409, message, messageArgs, data);
  }
}

class InternalServerError extends BaseHttpError {
  constructor(
    message: MessageDescriptor,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(500, message, messageArgs, data);
  }
}

class ServiceUnavailableError extends BaseHttpError {
  constructor(
    message: MessageDescriptor,
    messageArgs?: string | Record<string, string>,
    data?: unknown,
  ) {
    super(503, message, messageArgs, data);
  }
}

export {
  MessageDescriptor,
  BaseHttpError,
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
