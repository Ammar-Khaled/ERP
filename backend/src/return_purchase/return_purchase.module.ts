import { Module } from '@nestjs/common';
import { ReturnPurchaseService } from './return_purchase.service';
import { ReturnPurchaseController } from './return_purchase.controller';
import { returnPurchaseProviders } from './return_purchase.providers';
import { returnPurchaseItemProviders } from './return_purchase_item.providers';

@Module({
  controllers: [ReturnPurchaseController],
  providers: [
    ReturnPurchaseService,
    ...returnPurchaseProviders,
    ...returnPurchaseItemProviders,
  ],
})
export class ReturnPurchaseModule {}
