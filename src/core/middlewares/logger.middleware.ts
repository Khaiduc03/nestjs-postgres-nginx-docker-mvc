import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export function LoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  const { ip, method, path: url } = req;
  const userAgent = res.get('user-agent') || '';

  res.on('close', () => {
    const { statusCode } = res;
    const contentLength = res.get('content-length');
    Logger.debug(
      `🗿 ${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
    );
  });

  next();
}
