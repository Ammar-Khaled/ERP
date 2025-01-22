import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { categoriesProviders } from './categories.providers';
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule
import { branchesProviders } from 'src/branches/branches.providers';
@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [...categoriesProviders, ...branchesProviders, CategoriesService], // Add necessary providers
  exports: [CategoriesService], // Export CategoriesService if needed
})
export class CategoriesModule {}