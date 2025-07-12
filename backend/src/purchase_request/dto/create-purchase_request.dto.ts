import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreatePurchaseItemDto } from 'src/purchase_request/dto/create-purchase_item.dto';
import { Transform } from 'class-transformer';
export class CreatePurchaseRequestDto {
  @Transform(({ value }) => (value !== undefined ? value : new Date()))
  @Type(() => Date) 
  @IsDate()
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
