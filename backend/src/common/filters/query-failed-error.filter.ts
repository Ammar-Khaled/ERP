import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
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
          message:
            'A record with the same unique value already exists: ' + sqlMessage,
        });

      case 1451: // ER_ROW_IS_REFERENCED
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Cannot delete or update a parent row: a foreign key constraint fails: ' +
            sqlMessage,
        });

      case 1452: // ER_NO_REFERENCED_ROW
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Cannot add or update a child row: a foreign key constraint fails: ' +
            sqlMessage,
        });

      case 1048: // ER_BAD_NULL_ERROR
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Column cannot be null: ' + sqlMessage,
        });

      case 1054: // ER_BAD_FIELD_ERROR
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Unknown column in field list: ' + sqlMessage,
        });

      case 1146: // ER_NO_SUCH_TABLE
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Table does not exist: ' + sqlMessage,
        });

      case 1406: // ER_DATA_TOO_LONG
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Data too long for column: ' + sqlMessage,
        });

      case 1064: // ER_PARSE_ERROR
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'SQL syntax error: ' + sqlMessage,
        });

      default:
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Database operation failed: ' + sqlMessage,
        });
    }
  }
}
