import { Module } from '@nestjs/common';
import { ProductItemService } from './product_item.service'; // Service for ProductItem
import { ProductItemsController } from './product_item.controller'; // Controller for ProductItem
import { productItemProviders } from './product_item.providers'; // Providers for ProductItem
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule
import { productsProviders } from '../products/products.providers'; // Import Product providers if needed
import { variationOptionsProviders } from 'src/variation_option/variation_option.providers';
import { variationsProviders } from 'src/variation/variation.providers';
import { branchesProviders } from 'src/branches/branches.providers';
import { currencyProviders } from 'src/currency/currency.providers';
import { unitsProviders } from 'src/units/units.providers';
import { categoriesProviders } from 'src/categories/categories.providers';
import { ProductItemInventoryModule } from 'src/product_item_inventory/product_item_inventory.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import { productItemInventoryProviders } from '../product_item_inventory/product_item_inventory.providers';
import { inventoriesProviders } from '../inventories/inventories.providers';
import { ExpiredProductsScheduler } from './scheduler/expired-products.scheduler';

@Module({
  imports: [ConfigModule, DatabaseModule, ProductItemInventoryModule], // Include the DatabaseModule for DataSource injection
  controllers: [ProductItemsController], // Add ProductItem controller
  providers: [
    ...productItemProviders,
    ...branchesProviders,
    ...currencyProviders,
    ...unitsProviders,
    ...categoriesProviders,
    ...productsProviders,
    ...variationsProviders,
    ...variationOptionsProviders,
    ProductItemService,
    CloudinaryService,
    ...productItemInventoryProviders,
    ...inventoriesProviders,
    ExpiredProductsScheduler,
  ], // Add providers including related products
  exports: [ProductItemService], // Export ProductItemsService if other modules need it
})
export class ProductItemModule {}
