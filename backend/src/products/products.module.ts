import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { productsProviders } from './products.providers';
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule
import { branchesProviders } from 'src/branches/branches.providers';
import { categoriesProviders } from 'src/categories/categories.providers';
@Module({
  imports: [DatabaseModule], // Include the DatabaseModule for DataSource injection
  controllers: [ProductsController],
  providers: [...productsProviders, ...branchesProviders, ... categoriesProviders, ProductsService], // Add productsProviders to the module
  exports: [ProductsService], // Export ProductsService if other modules need it
})
export class ProductsModule {}