import { DataSource } from 'typeorm';
import { Variation } from './entities/variation.entity';  // Adjust the import path if needed

export const variationsProviders = [
  {
    provide: 'VARIATION_REPOSITORY',  // Provide a unique token for the Variation repository
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Variation),  // Create a repository using DataSource
    inject: ['DATA_SOURCE'],  // Inject the DATA_SOURCE from the DatabaseModule
  },
];