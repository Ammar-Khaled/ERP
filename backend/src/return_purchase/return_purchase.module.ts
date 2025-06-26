import { Module } from '@nestjs/common';
import { ReturnPurchaseService } from './return_purchase.service';
import { ReturnPurchaseController } from './return_purchase.controller';
import { returnPurchaseProviders } from './return_purchase.providers';
import { returnPurchaseItemProviders } from './return_purchase_item.providers';
import { DatabaseModule } from 'src/common/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ReturnPurchaseController],
  providers: [
    ReturnPurchaseService,
    ...returnPurchaseProviders,
    ...returnPurchaseItemProviders,
  ],
})
export class ReturnPurchaseModule {}
