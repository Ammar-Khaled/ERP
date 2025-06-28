import { Module } from '@nestjs/common';
import { ReturnPurchaseService } from './return_purchase.service';
import { ReturnPurchaseController } from './return_purchase.controller';
import { returnPurchaseProviders } from './return_purchase.providers';
import { returnPurchaseItemProviders } from './return_purchase_item.providers';
import { DatabaseModule } from 'src/common/database.module';
import { ReturnPurchaseItemService } from './return_purchase_item.service';
import { purchaseRequestProviders } from 'src/purchase_request/purchase_request.providers';
import { statusProviders } from 'src/status/status.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ReturnPurchaseController],
  providers: [
    ReturnPurchaseService,
    ...returnPurchaseProviders,
    ReturnPurchaseItemService,
    ...returnPurchaseItemProviders,
    ...purchaseRequestProviders,
    ...statusProviders,
  ],
})
export class ReturnPurchaseModule {}
