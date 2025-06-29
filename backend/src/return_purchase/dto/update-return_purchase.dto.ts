import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateReturnPurchaseDto } from './create-return_purchase.dto';

export class UpdateReturnPurchaseDto extends PartialType(
  // Can't update the purchaseRequestId, it's the identifier of the return entity
  OmitType(CreateReturnPurchaseDto, ['purchaseRequestId'] as const),
) {}
