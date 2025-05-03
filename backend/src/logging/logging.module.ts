import { Module } from '@nestjs/common';
import { DatabaseLoggerService } from './database-logger.service';
import { logRepositoryProvider } from './log.repository';
import { DatabaseModule } from '../common/database.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';

@Module({
  imports: [DatabaseModule],
  providers: [
    DatabaseLoggerService,
    logRepositoryProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [DatabaseLoggerService],
})
export class LoggingModule {}
