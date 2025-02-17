import { DataSource } from 'typeorm';
import { PurchaseRequest } from './entities/purchase_request.entity';

export const purchaseRequestProviders = [
  {
    provide: 'PURCHASE_REQUEST_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseRequest),
    inject: ['DATA_SOURCE'],
  },
];
