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
          isSuccess: false,
          message:
            'A record with the same unique value already exists: ' + sqlMessage,
          data: null,
        });

      case 1451: // ER_ROW_IS_REFERENCED
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message:
            'Cannot delete or update a parent row: a foreign key constraint fails: ' +
            sqlMessage,
          data: null,
        });

      case 1452: // ER_NO_REFERENCED_ROW
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message:
            'Cannot add or update a child row: a foreign key constraint fails: ' +
            sqlMessage,
          data: null,
        });

      case 1048: // ER_BAD_NULL_ERROR
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message: 'Column cannot be null: ' + sqlMessage,
          data: null,
        });

      case 1054: // ER_BAD_FIELD_ERROR
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message: 'Unknown column in field list: ' + sqlMessage,
          data: null,
        });

      case 1406: // ER_DATA_TOO_LONG
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message: 'Data too long for column: ' + sqlMessage,
          data: null,
        });

      case 1364: // ER_NO_DEFAULT_FOR_FIELD
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          isSuccess: false,
          message: 'Field does not have a default value: ' + sqlMessage,
          data: null,
        });

      default:
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          isSuccess: false,
          message: 'Database operation failed: ' + sqlMessage,
          data: null,
        });
    }
  }
}
