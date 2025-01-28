import { Module } from '@nestjs/common';
import { ProductItemInventoryService } from './product_item_inventory.service';
import { ProductItemInventoryController } from './product_item_inventory.controller';
import { productItemInventoryProviders } from './product_item_inventory.providers';
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule
import { productItemProviders } from '../product_item/product_item.providers'; // Import ProductItem providers
import { inventoriesProviders } from '../inventories/inventories.providers'; // Import Inventory providers

@Module({
  imports: [DatabaseModule], // Include the DatabaseModule for DataSource injection
  controllers: [ProductItemInventoryController],
  providers: [
    ...productItemInventoryProviders,
    ...productItemProviders,
    ...inventoriesProviders,
    ProductItemInventoryService,
  ], // Add providers for ProductItemInventory, ProductItem, and Inventory
  exports: [ProductItemInventoryService], // Export ProductItemInventoryService if other modules need it
})
export class ProductItemInventoryModule {}
