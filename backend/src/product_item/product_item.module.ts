import { Module } from '@nestjs/common';
import { ProductItemService } from './product_item.service'; // Service for ProductItem
import { ProductItemController } from './product_item.controller'; // Controller for ProductItem
import { productItemProviders } from './product_item.providers'; // Providers for ProductItem
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule
import { productsProviders } from '../products/products.providers'; // Import Product providers if needed

@Module({
  imports: [DatabaseModule], // Include the DatabaseModule for DataSource injection
  controllers: [ProductItemController], // Add ProductItem controller
  providers: [...productItemProviders, ...productsProviders, ProductItemService], // Add providers including related products
  exports: [ProductItemService], // Export ProductItemsService if other modules need it
})
export class ProductItemModule {}