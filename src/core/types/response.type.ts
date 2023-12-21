import { HttpStatus } from '@nestjs/common';

interface PayloadHttp {
  code: number;
  message: string;
  data?: any | undefined;
}

export class Http {
  code: number;
  message: string;

  constructor({ code, message }: PayloadHttp) {
    this.code = code;
    this.message = message;
  }
}

export class HttpError<T> extends Http {
  data?: T | Array<T>;

  constructor({
    code = HttpStatus.INTERNAL_SERVER_ERROR,
    message = 'Internal Server Error',
    data = {},
  }: PayloadHttp) {
    super({ code, message });
    this.data = data;
  }
}

export class HttpResponse<T> extends Http {
  data?: T | Array<T>;

  constructor({
    code = HttpStatus.OK,
    message = 'OK',
    data = {},
  }: PayloadHttp) {
    super({ code, message });
    this.data = data;
  }
}
