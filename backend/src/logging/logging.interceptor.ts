import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatabaseLoggerService } from './database-logger.service';
import { Request } from 'express';
import { Log } from './log.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: DatabaseLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const startTime = Date.now();

    const log = new Log();
    log.packetType = 'request';
    log.userId = request['user']?.sub || null;
    log.ipAddress = request.ip;
    log.userAgent = request.headers['user-agent'];
    log.action = `${context.getClass().name}.${context.getHandler().name}`;
    log.endpoint = request.originalUrl;
    log.method = request.method;

    this.logger.log(log);

    return next.handle().pipe(
      tap(() => {
        // Log successful request
        log.packetType = 'response';
        log.responseTime = Date.now() - startTime;
        this.logger.log(log);
      }),
      catchError((error) => {
        log.packetType = 'response';
        log.responseTime = Date.now() - startTime;
        log.trace = error.stack;
        log.errorMessage = error.message;
        this.logger.error(log);

        throw error; // Rethrow after logging
      }),
    );
  }
}
