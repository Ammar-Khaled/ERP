import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreatePurchaseItemDto } from 'src/purchase_request/dto/create-purchase_item.dto';

export class CreatePurchaseRequestDto {
  @IsOptional() // if not provided, use the current date as a default
  @Transform(({ value }) => (value !== undefined ? value : new Date()))
  @Type(() => Date) // converts input to date
  @IsDate()
  date?: Date;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  branchId: number;

  @IsNotEmpty()
  supplierId: number;

  @IsNotEmpty()
  statusId: number;

  @IsNotEmpty()
  currencyId: number;

  @IsNotEmpty()
  @ValidateNested({ each: true }) // Validates each element in the array
  @Type(() => CreatePurchaseItemDto) // Transforms each element to CreatePurchaseItemDto
  purchaseItemsDtos: CreatePurchaseItemDto[];
}
