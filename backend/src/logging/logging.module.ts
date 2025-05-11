import { Module } from '@nestjs/common';
import { DatabaseLoggerService } from './database-logger.service';
import { logRepositoryProvider } from './log.repository';
import { DatabaseModule } from '../common/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [DatabaseLoggerService, logRepositoryProvider],
  exports: [DatabaseLoggerService],
})
export class LoggingModule {}
