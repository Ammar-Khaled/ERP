import { DataSource } from 'typeorm';
import { PurchaseItem } from './entities/purchase_item.entity';

export const purchaseItemProviders = [
  {
    provide: 'PURCHASE_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseItem),
    inject: ['DATA_SOURCE'],
  },
];
