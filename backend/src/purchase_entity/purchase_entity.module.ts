import { Module } from '@nestjs/common';
import { PurchaseEntityService } from './purchase_entity.service';
import { PurchaseEntitiesController } from './purchase_entity.controller';
import { DatabaseModule } from 'src/common/database.module';
import { purchaseEntityProviders } from './purchase_entity.providers';
import { branchesProviders } from '../branches/branches.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [PurchaseEntitiesController],
  providers: [
    ...purchaseEntityProviders,
    PurchaseEntityService,
    ...branchesProviders,
  ],
  exports: [PurchaseEntityService],
})
export class PurchaseEntityModule {}
