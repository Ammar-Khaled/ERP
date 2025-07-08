import { DataSource } from 'typeorm';
import { PurchaseInventory } from './entities/purchase_inventory.entity';

export const purchaseInventoryProviders = [
  {
    provide: 'PURCHASE_INVENTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseInventory),
    inject: ['DATA_SOURCE'],
  },
];
