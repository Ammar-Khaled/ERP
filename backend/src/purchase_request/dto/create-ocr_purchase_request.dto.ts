import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePurchaseItemDto } from 'src/purchase_request/dto/create-purchase_item.dto';

export class CreatePurchaseRequestOCRDto {
  @IsDate()
  @IsOptional()
  date: Date;

  @IsNotEmpty()
  @IsString()
  supplierName: string;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @ValidateNested({ each: true }) // Validates each element in the array
  @Type(() => CreatePurchaseItemDto) // Transforms each element to CreatePurchaseItemDto
  purchaseItemsDtos: CreatePurchaseItemDto[];
}
