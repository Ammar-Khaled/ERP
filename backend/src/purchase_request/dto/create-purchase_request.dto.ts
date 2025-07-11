import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreatePurchaseItemDto } from 'src/purchase_request/dto/create-purchase_item.dto';

export class CreatePurchaseRequestDto {
  @IsDate()
  @IsOptional()
  date: Date;

  @IsNotEmpty()
  supplierId: number;

  @IsNotEmpty()
  currencyId: number;

  @IsNotEmpty()
  inventoryId: number;

  @IsNotEmpty()
  @ValidateNested({ each: true }) // Validates each element in the array
  @Type(() => CreatePurchaseItemDto) // Transforms each element to CreatePurchaseItemDto
  purchaseItemsDtos: CreatePurchaseItemDto[];
}
