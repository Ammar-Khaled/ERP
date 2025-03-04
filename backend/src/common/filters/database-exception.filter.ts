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
    const errno = (exception as any).errno;
    const sqlMessage = (exception as any).sqlMessage || exception.message;

    // Handle specific MySQL errors
    switch (errno) {
      case 1062: // ER_DUP_ENTRY
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'A record with the same unique value already exists',
          detail: sqlMessage,
        });

      case 1451: // ER_ROW_IS_REFERENCED
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message:
            'Cannot delete or update a parent row: a foreign key constraint fails',
          detail: sqlMessage,
        });

      case 1452: // ER_NO_REFERENCED_ROW
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message:
            'Cannot add or update a child row: a foreign key constraint fails',
          detail: sqlMessage,
        });

      case 1048: // ER_BAD_NULL_ERROR
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Column cannot be null',
          detail: sqlMessage,
        });

      case 1054: // ER_BAD_FIELD_ERROR
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Unknown column in field list',
          detail: sqlMessage,
        });

      case 1146: // ER_NO_SUCH_TABLE
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Table does not exist',
          detail: sqlMessage,
        });

      case 1406: // ER_DATA_TOO_LONG
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Data too long for column',
          detail: sqlMessage,
        });

      case 1064: // ER_PARSE_ERROR
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'SQL syntax error',
          detail: sqlMessage,
        });

      default:
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Database operation failed',
          detail:
            process.env.NODE_ENV === 'production'
              ? 'An unexpected database error occurred'
              : sqlMessage,
        });
    }
  }
}
