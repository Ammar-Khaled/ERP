import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Log } from './log.entity';

@Injectable()
export class DatabaseLoggerService implements LoggerService {
  constructor(
    @Inject('LOG_REPOSITORY')
    private readonly logRepository: Repository<Log>,
  ) {}

  async log(log: Log) {
    log.level = 'log';
    await this.logRepository.save(log);
  }

  async error(log: Log) {
    log.level = 'error';
    await this.logRepository.save(log);
  }

  async warn(log: Log) {
    log.level = 'warn';
    await this.logRepository.save(log);
  }

  async debug(log: Log) {
    log.level = 'debug';
    await this.logRepository.save(log);
  }

  async verbose(log: Log) {
    log.level = 'verbose';
    await this.logRepository.save(log);
  }

  async getLogs(userId?: number): Promise<Log[]> {
    if (userId) {
      return this.logRepository.find({
        where: { userId },
        order: { timestamp: 'DESC' },
      });
    } else {
      return this.logRepository.find({
        order: { timestamp: 'DESC' },
      });
    }
  }
}
