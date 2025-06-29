import { Module } from '@nestjs/common';
import { PurchaseRequestService } from './purchase_request.service';
import { PurchaseRequestsController } from './purchase_request.controller';
import { DatabaseModule } from 'src/common/database.module';
import { purchaseRequestProviders } from './purchase_request.providers';
import { userProviders } from 'src/users/users.providers';
import { branchesProviders } from 'src/branches/branches.providers';
import { supplierProviders } from 'src/suppliers/suppliers.providers';
import { statusProviders } from 'src/status/status.providers';
import { currencyProviders } from 'src/currency/currency.providers';
import { purchaseEntityProviders } from 'src/purchase_entity/purchase_entity.providers';
import { PdfService } from '../common/pdf/pdf.service';
import { DatabaseLoggerService } from 'src/logging/database-logger.service';
import { logRepositoryProvider } from 'src/logging/log.repository';
import { PurchaseEntityModule } from '../purchase_entity/purchase_entity.module';

@Module({
  imports: [DatabaseModule, PurchaseEntityModule],
  controllers: [PurchaseRequestsController],
  providers: [
    PurchaseRequestService,
    ...purchaseRequestProviders,
    ...userProviders,
    ...branchesProviders,
    ...supplierProviders,
    ...statusProviders,
    ...currencyProviders,
    ...purchaseEntityProviders,
    PdfService,
    DatabaseLoggerService,
    logRepositoryProvider,
  ],
})
export class PurchaseRequestModule {}
