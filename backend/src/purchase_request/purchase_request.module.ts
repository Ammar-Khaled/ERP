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
  ],
})
export class PurchaseRequestModule {}
