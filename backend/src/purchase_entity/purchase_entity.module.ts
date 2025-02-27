import { Module } from '@nestjs/common';
import { PurchaseEntityService } from './purchase_entity.service';
import { PurchaseEntityController } from './purchase_entity.controller';
import { DatabaseModule } from 'src/common/database.module';
import { purchaseEntityProviders } from './purchase_entity.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [PurchaseEntityController],
  providers: [...purchaseEntityProviders, PurchaseEntityService],
  exports: [PurchaseEntityService],
})
export class PurchaseEntityModule {}
