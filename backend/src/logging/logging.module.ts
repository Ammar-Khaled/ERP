import { Module } from '@nestjs/common';
import { DatabaseLoggerService } from './database-logger.service';
import { logRepositoryProvider } from './log.repository';
import { DatabaseModule } from '../common/database.module';
import { LogsController } from './logs.controller';

@Module({
  imports: [DatabaseModule],
  providers: [DatabaseLoggerService, logRepositoryProvider],
  controllers: [LogsController],
  exports: [DatabaseLoggerService],
})
export class LoggingModule {}
