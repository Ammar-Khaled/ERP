import { Module } from '@nestjs/common';
import { purchaseInventoryProviders } from './purchase_inventory.providers';
import { PurchaseInventoryService } from './purchase_inventory.service';
import { DatabaseModule } from 'src/common/database.module';
import { InventoriesModule } from 'src/inventories/inventories.module';

@Module({
  imports: [DatabaseModule, InventoriesModule],
  providers: [PurchaseInventoryService, ...purchaseInventoryProviders],
  exports: [PurchaseInventoryService],
})
export class PurchaseInventoryModule {}
