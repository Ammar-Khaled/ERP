import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { DatabaseModule } from 'src/common/database.module';
import { orderProviders } from './order.providers';
import { branchesProviders } from 'src/branches/branches.providers';
import { userProviders } from 'src/users/users.providers';
import { clientsProviders } from 'src/clients/clients.providers';
import { couponProviders } from 'src/coupon/coupon.providers';
import { currencyProviders } from 'src/currency/currency.providers';
import { productItemProviders } from 'src/product_item/product_item.providers';
import { OrderItemService } from 'src/order_item/order_item.service';
import { orderItemProviders } from 'src/order_item/order_item.providers';
import { ProductItemModule } from 'src/product_item/product_item.module';
import { statusProviders } from 'src/status/status.providers';
import { productItemInventoryProviders } from 'src/product_item_inventory/product_item_inventory.providers';
import { ProductItemInventoryService } from 'src/product_item_inventory/product_item_inventory.service';
import { ProductItemInventoryModule } from 'src/product_item_inventory/product_item_inventory.module';

@Module({
  imports: [DatabaseModule, ProductItemModule,ProductItemInventoryModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    ...orderProviders,
    ...branchesProviders,
    ...userProviders,
    ...clientsProviders,
    ...couponProviders,
    ...currencyProviders,
    ...productItemProviders,
    ...orderItemProviders,
    ...statusProviders,
    ...productItemInventoryProviders,
    OrderItemService,
  ],
})
export class OrderModule {}
