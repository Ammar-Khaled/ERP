import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorCode = (exception as any).code;

    if (
      errorCode === '23505' ||
      errorCode === 'ER_DUP_ENTRY' ||
      (exception as any).errno === 1062
    ) {
      const detail = (exception as any).detail || exception.message;

      response.status(HttpStatus.CONFLICT).json({
        message: 'A record with the same unique value already exists',
        detail: detail,
      });
    } else {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json('Internal server error');
    }
  }
}
