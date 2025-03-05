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
import { OrderItemController } from 'src/order_item/order_item.controller';
import { OrderItemService } from 'src/order_item/order_item.service';
import { orderItemProviders } from 'src/order_item/order_item.providers';

@Module({
  imports: [DatabaseModule],
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
    OrderItemService
  ],
})
export class OrderModule {}
