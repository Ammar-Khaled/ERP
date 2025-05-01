import { DataSource } from 'typeorm';
import { Log } from './log.entity';

export const logRepositoryProvider = {
  provide: 'LOG_REPOSITORY',
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Log),
  inject: ['DATA_SOURCE'],
};
