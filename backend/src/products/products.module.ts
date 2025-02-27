import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { productsProviders } from './products.providers';
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule
import { branchesProviders } from 'src/branches/branches.providers';
import { categoriesProviders } from 'src/categories/categories.providers';
import { unitsProviders } from 'src/units/units.providers';
import { currencyProviders } from 'src/currency/currency.providers';
import { ProductItemModule } from 'src/product_item/product_item.module';
@Module({
  imports: [DatabaseModule, ProductItemModule], // Include the DatabaseModule for DataSource injection
  controllers: [ProductsController],
  providers: [...productsProviders, ...branchesProviders, ... categoriesProviders,...unitsProviders, ...currencyProviders, ProductsService], // Add productsProviders to the module
  exports: [ProductsService], // Export ProductsService if other modules need it
})
export class ProductsModule {}