import { DataSource } from 'typeorm';
import { Currency } from './entities/currency.entity';

export const currencyProviders = [
  {
    provide: 'CURRENCY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Currency),
    inject: ['DATA_SOURCE'], // Inject the DATA_SOURCE from your DatabaseModule
  },
];
