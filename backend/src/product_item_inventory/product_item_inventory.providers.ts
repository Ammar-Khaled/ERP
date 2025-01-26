import { DataSource } from 'typeorm';
import { ProductItemInventory } from './entities/product_item_inventory.entity';

export const productItemInventoryProviders = [
  {
    provide: 'PRODUCT_ITEM_INVENTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ProductItemInventory),
    inject: ['DATA_SOURCE'], // Inject the DATA_SOURCE from your DatabaseModule
  },
];