import { DataSource } from 'typeorm';
import { VariationOption } from './entities/variation_option.entity'; // Ensure the correct path

export const variationOptionsProviders = [
  {
    provide: 'VARIATION_OPTION_REPOSITORY', // Unique token for the VariationOption repository
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(VariationOption),
    inject: ['DATA_SOURCE'], // Inject the DATA_SOURCE from the DatabaseModule
  },
];
