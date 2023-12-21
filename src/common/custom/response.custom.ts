import { HttpException, HttpStatus } from '@nestjs/common';
import { IPanigationResponse } from 'src/modules/type';

interface PayloadHttp {
  code: number;
  message: string;
  data?: any | undefined;
}

interface PayloadDataPanigation {
  panigation: {
    page: number;
    page_size: number;
    total_record_count: number;
    take: number;
    next_page: number;
    previous_page: number;
    next_chapter?: string;
    previous_chapter?: string;
  };
  records: any | undefined;
}

export class Http {
  code: number;
  message: string;

  constructor({ code, message }: PayloadHttp) {
    this.code = code;
    this.message = message;
  }
}
export class HttpPanigation {
  code: number;
  message: string;
  data?: PayloadDataPanigation | undefined;

  constructor({ code, message, data }: PayloadHttp) {
    this.code = code;
    this.message = message;
    this.data = data;
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

export function createSuccessResponse(
  data: any,
  message: string
): HttpResponse<Http> {
  return new HttpResponse({
    code: HttpStatus.OK,
    message: `${message} successfully!!`,
    data: data,
  });
}

export function createSuccessResponsePanigation(
  data: HttpPanigation,
  message: string
): HttpResponse<Http> {
  return new HttpResponse({
    code: HttpStatus.OK,
    message: `${message} successfully 💥. `,
    data: data,
  });
}

export function createBadRequset(message: string): HttpResponse<Http> {
  return new HttpError({
    code: HttpStatus.BAD_REQUEST,
    message: `${message} failed 😡.`,
  });
}

export function createBadRequsetNoMess(message: string): HttpResponse<Http> {
  return new HttpError({
    code: HttpStatus.BAD_REQUEST,
    message: `${message}`,
  });
}

export function createTooManyRequest(message: string): HttpResponse<Http> {
  return new HttpError({
    code: HttpStatus.TOO_MANY_REQUESTS,
    message: `${message}`,
  });
}

export function createSuccessResponseNoContent(
  data: any,
  message: string
): HttpResponse<Http> {
  return new HttpResponse({
    code: HttpStatus.NO_CONTENT,
    message: `${message} is null 😡.`,
    data: data,
  });
}

export function createNotFound(message: string): HttpResponse<Http> {
  return new HttpError({
    code: HttpStatus.NOT_FOUND,
    message: `${message} not found 😡`,
  });
}

export function createUnAuthorized(message: string): HttpResponse<Http> {
  return new HttpError({
    code: HttpStatus.UNAUTHORIZED,
    message: `${message} failed 😡.`,
  });
}

export function createFORBIDDEN(message: string): HttpResponse<Http> {
  return new HttpError({
    code: HttpStatus.FORBIDDEN,
    message: `${message}😡.`,
  });
}

export function throwDataError<T>(data: T, message: string) {
  if (data === null && !data) {
    throw new HttpException(`${message} failed 😡.`, HttpStatus.BAD_REQUEST);
  }
}

export function panigationData<T>(
  page = 1,
  data: T[],
  totalData: number,
  perPage: number = 21
): IPanigationResponse<T> {
  //const perPage = 21;
  const totalPages = Math.ceil(totalData / perPage);
  const canNext = page < totalPages;
  const currentDataSize = data.length;
  return {
    totalData: Number(totalData),
    totalPage: Number(totalPages),
    currentPage: Number(page),
    currentDataSize,
    canNext,
    data,
  };
}
