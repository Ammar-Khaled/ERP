import { Module } from '@nestjs/common';
import { ReturnService } from './return.service';
import { ReturnController } from './return.controller';
import { DatabaseModule } from 'src/common/database.module';
import { returnProviders } from './return.providers';
import { orderItemProviders } from 'src/order/order_item.providers';
import { returnItemProviders } from 'src/return_item/return_item.provider';
import { ReturnItemService } from 'src/return_item/return_item.service';
import { orderProviders } from 'src/order/order.providers';
import { statusProviders } from 'src/status/status.providers';
import { productItemProviders } from 'src/product_item/product_item.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ReturnController],
  providers: [
    ReturnService,
    ...returnProviders,
    ...orderItemProviders,
    ReturnItemService,
    ...returnItemProviders,
    ...orderProviders,
    ...statusProviders,
    ...productItemProviders,
  ],
})
export class ReturnModule {}
