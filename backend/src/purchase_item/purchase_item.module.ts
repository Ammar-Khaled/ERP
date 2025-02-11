import { Module } from '@nestjs/common';
import { PurchaseItemService } from './purchase_item.service';
import { PurchaseItemController } from './purchase_item.controller';
import { purchaseItemProviders } from './purchase_item.providers';
import { DatabaseModule } from 'src/common/database.module';
import { PurchaseEntityModule } from 'src/purchase_entity/purchase_entity.module';
import { purchaseEntityProviders } from 'src/purchase_entity/purchase_entity.providers';

@Module({
  imports: [DatabaseModule, PurchaseEntityModule],
  controllers: [PurchaseItemController],
  providers: [PurchaseItemService, ...purchaseItemProviders, ...purchaseEntityProviders],
  exports: [PurchaseItemService]
})
export class PurchaseItemModule {}
