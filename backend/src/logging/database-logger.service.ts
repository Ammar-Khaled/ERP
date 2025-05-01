import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Log } from './log.entity';

@Injectable()
export class DatabaseLoggerService implements LoggerService {
  constructor(
    @Inject('LOG_REPOSITORY')
    private readonly logRepository: Repository<Log>,
  ) {}

  async log(message: string, context?: string, metadata?: Record<string, any>) {
    await this.logRepository.save({
      level: 'log',
      message,
      timestamp: new Date(),
      context,
      metadata: JSON.stringify(metadata),
    });
  }

  async error(
    message: string,
    context?: string,
    trace?: string,
    metadata?: Record<string, any>,
  ) {
    await this.logRepository.save({
      level: 'error',
      message,
      timestamp: new Date(),
      context,
      trace,
      metadata: JSON.stringify(metadata),
    });
  }

  async warn(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ) {
    await this.logRepository.save({
      level: 'warn',
      message,
      timestamp: new Date(),
      context,
      metadata: JSON.stringify(metadata),
    });
  }

  async debug(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ) {
    await this.logRepository.save({
      level: 'debug',
      message,
      timestamp: new Date(),
      context,
      metadata: JSON.stringify(metadata),
    });
  }

  async verbose(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ) {
    await this.logRepository.save({
      level: 'verbose',
      message,
      timestamp: new Date(),
      context,
      metadata: JSON.stringify(metadata),
    });
  }
}
