import { DataSource } from 'typeorm';
import { ProductItem } from './entities/product_item.entity'; // Import the ProductItem entity

export const productItemProviders = [
  {
    provide: 'PRODUCT_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductItem),
    inject: ['DATA_SOURCE'], // Inject the DATA_SOURCE from your DatabaseModule
  },
];
