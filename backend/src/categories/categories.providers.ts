import { DataSource } from 'typeorm';
import { Category } from './entities/category.entity';  // Adjust the import path if needed

export const categoriesProviders = [
  {
    provide: 'CATEGORY_REPOSITORY',  // Provide a unique token for the Category repository
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Category),  // Create a repository using DataSource
    inject: ['DATA_SOURCE'],  // Inject the DATA_SOURCE from the DatabaseModule
  },
];