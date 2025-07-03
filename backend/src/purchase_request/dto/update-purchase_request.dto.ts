import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePurchaseRequestDto } from './create-purchase_request.dto';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePurchaseItemDto } from './update-purchase_item.dto';

export class UpdatePurchaseRequestDto extends PartialType(
  OmitType(CreatePurchaseRequestDto, ['purchaseItemsDtos'] as const),
) {
  @IsNotEmpty()
  @ValidateNested({ each: true }) // Validates each element in the array
  @Type(() => UpdatePurchaseItemDto) // Transforms each element to CreatePurchaseItemDto
  purchaseItemsDtos: UpdatePurchaseItemDto[]; // the new items list of the purchase request
}
