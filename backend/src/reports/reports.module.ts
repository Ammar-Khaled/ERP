import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DatabaseModule } from 'src/common/database.module';
import { orderProviders } from 'src/order/order.providers';
import { purchaseRequestProviders } from 'src/purchase_request/purchase_request.providers';
import { returnProviders } from 'src/return/return.providers';
import { returnItemProviders } from 'src/return/return_item.provider';
import { productItemProviders } from 'src/product_item/product_item.providers';
import { orderItemProviders } from 'src/order/order_item.providers';
import { ClientsModule } from 'src/clients/clients.module';  // Import ClientsModule
import { clientsProviders } from 'src/clients/clients.providers';
import { supplierProviders } from 'src/suppliers/suppliers.providers';

@Module({
  imports: [DatabaseModule],  // Add ClientsModule to imports
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ...orderProviders,
    ...purchaseRequestProviders,
    ...returnProviders,
    ...returnItemProviders,
    ...productItemProviders,
    ...orderItemProviders,
    ...clientsProviders,
    ...supplierProviders,
  ],
})
export class ReportsModule {}
