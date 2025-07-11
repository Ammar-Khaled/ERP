import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrdersController } from './order.controller';
import { DatabaseModule } from 'src/common/database.module';
import { orderProviders } from './order.providers';
import { branchesProviders } from 'src/branches/branches.providers';
import { userProviders } from 'src/users/users.providers';
import { clientsProviders } from 'src/clients/clients.providers';
import { couponProviders } from 'src/coupon/coupon.providers';
import { currencyProviders } from 'src/currency/currency.providers';
import { productItemProviders } from 'src/product_item/product_item.providers';
import { orderItemProviders } from 'src/order/order_item.providers';
import { ProductItemModule } from 'src/product_item/product_item.module';
import { statusProviders } from 'src/status/status.providers';
import { productItemInventoryProviders } from 'src/product_item_inventory/product_item_inventory.providers';
import { ProductItemInventoryModule } from 'src/product_item_inventory/product_item_inventory.module';
import { PdfService } from '../common/pdf/pdf.service';
import { inventoriesProviders } from 'src/inventories/inventories.providers';
import { DatabaseLoggerService } from 'src/logging/database-logger.service';
import { logRepositoryProvider } from 'src/logging/log.repository';

@Module({
  imports: [DatabaseModule, ProductItemModule, ProductItemInventoryModule],
  controllers: [OrdersController],
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
    ...inventoriesProviders,
    PdfService,
    DatabaseLoggerService,
    logRepositoryProvider,
  ],
})
export class OrderModule {}
