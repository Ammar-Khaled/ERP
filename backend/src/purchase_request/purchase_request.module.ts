import { Module } from '@nestjs/common';
import { PurchaseRequestService } from './purchase_request.service';
import { PurchaseRequestController } from './purchase_request.controller';

@Module({
  controllers: [PurchaseRequestController],
  providers: [PurchaseRequestService],
})
export class PurchaseRequestModule {}
