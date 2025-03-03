import { Module } from '@nestjs/common';
import { PurchaseRequestService } from './purchase_request.service';
import { PurchaseRequestController } from './purchase_request.controller';
import { DatabaseModule } from 'src/common/database.module';
import { purchaseRequestProviders } from './purchase_request.providers';
import { userProviders } from 'src/users/users.providers';
import { branchesProviders } from 'src/branches/branches.providers';
import { supplierProviders } from 'src/supplier/suppliers.providers';
import { statusProviders } from 'src/status/status.providers';
import { currencyProviders } from 'src/currency/currency.providers';
import { PurchaseItemService } from 'src/purchase_item/purchase_item.service';
import { purchaseItemProviders } from 'src/purchase_item/purchase_item.providers';
import { purchaseEntityProviders } from 'src/purchase_entity/purchase_entity.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [PurchaseRequestController],
  providers: [
    PurchaseRequestService,
    ...purchaseRequestProviders,
    ...userProviders,
    ...branchesProviders,
    ...supplierProviders,
    ...statusProviders,
    ...currencyProviders,
    PurchaseItemService,
    ...purchaseItemProviders,
    ...purchaseEntityProviders,
  ],
})
export class PurchaseRequestModule {}
