import { DataSource } from 'typeorm';
import { Treasury } from './entities/treasury.entity';

export const treasuryProviders = [
  {
    provide: 'TREASURY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Treasury),
    inject: ['DATA_SOURCE'],
  },
];
