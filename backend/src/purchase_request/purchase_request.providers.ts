import { DataSource } from 'typeorm';
import { PurchaseRequest } from './entities/purchase_request.entity';
import { PurchaseItem } from './entities/purchase_item.entity';

export const purchaseRequestProviders = [
  {
    provide: 'PURCHASE_REQUEST_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseRequest),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PURCHASE_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseItem),
    inject: ['DATA_SOURCE'],
  },
];
