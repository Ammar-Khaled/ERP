import { Module } from '@nestjs/common';
import { PurchaseInventoryService } from './purchase_inventory.service';
import { purchaseInventoryProviders } from './purchase_inventory.providers';
import { purchaseEntityProviders } from '../purchase_entity/purchase_entity.providers';
import { InventoriesModule } from '../inventories/inventories.module';
import { DatabaseModule } from '../common/database.module';

@Module({
  imports: [
    DatabaseModule, // Add DatabaseModule to provide DATA_SOURCE
    InventoriesModule,
  ],
  providers: [
    PurchaseInventoryService,
    ...purchaseInventoryProviders,
    ...purchaseEntityProviders,
  ],
  exports: [PurchaseInventoryService],
})
export class PurchaseInventoryModule {}
