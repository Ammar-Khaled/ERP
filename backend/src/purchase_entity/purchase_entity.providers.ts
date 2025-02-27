import { DataSource } from 'typeorm';
import { PurchaseEntity } from './entities/purchase_entity.entity';

export const purchaseEntityProviders = [
  {
    provide: 'PURCHASE_ENTITY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseEntity),
    inject: ['DATA_SOURCE'],
  },
];
