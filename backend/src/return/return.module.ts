import { Module } from '@nestjs/common';
import { ReturnService } from './return.service';
import { ReturnsController } from './return.controller';
import { DatabaseModule } from 'src/common/database.module';
import { returnProviders } from './return.providers';
import { orderItemProviders } from 'src/order/order_item.providers';
import { returnItemProviders } from 'src/return/return_item.provider';
import { ReturnItemService } from 'src/return/return_item.service';
import { orderProviders } from 'src/order/order.providers';
import { statusProviders } from 'src/status/status.providers';
import { productItemProviders } from 'src/product_item/product_item.providers';
import { ReturnItemController } from './return_item.controller';
import { productItemInventoryProviders } from 'src/product_item_inventory/product_item_inventory.providers';
import { ProductItemInventoryService } from 'src/product_item_inventory/product_item_inventory.service';
import { inventoriesProviders } from 'src/inventories/inventories.providers';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [ReturnsController, ReturnItemController],
  providers: [
    ReturnService,
    ...returnProviders,
    ...orderItemProviders,
    ReturnItemService,
    ...returnItemProviders,
    ...orderProviders,
    ...statusProviders,
    ProductItemInventoryService,
    ...productItemInventoryProviders,
    ...productItemProviders,
    ...inventoriesProviders,
    ...returnItemProviders,
  ],
})
export class ReturnModule {}
