import { DataSource } from 'typeorm';
import { Unit } from './entities/unit.entity';

export const unitsProviders = [
  {
    provide: 'UNIT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Unit),
    inject: ['DATA_SOURCE'], // Inject the DATA_SOURCE from your DatabaseModule
  },
];
