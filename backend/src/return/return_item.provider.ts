import { DataSource } from 'typeorm';
import { ReturnItem } from './entities/return_item.entity';

export const returnItemProviders = [
  {
    provide: 'RETURN_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ReturnItem),
    inject: ['DATA_SOURCE'],
  },
];
