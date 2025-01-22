import { Inventory } from './entities/inventory.entity';
import { DataSource } from 'typeorm';

export const inventoriesProviders = [
  {
    provide: 'INVENTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Inventory),
    inject: ['DATA_SOURCE'],
  },
];
