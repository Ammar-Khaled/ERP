import { DataSource } from 'typeorm';
import { AccountType } from './entities/account_type.entity';

export const accountTypesProviders = [
  {
    provide: 'ACCOUNT_TYPE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AccountType),
    inject: ['DATA_SOURCE'],
  },
];
