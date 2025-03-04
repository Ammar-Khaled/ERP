import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePurchaseItemDto } from 'src/purchase_item/dto/create-purchase_item.dto';

export class CreatePurchaseRequestDto {
  @IsOptional() // if not provided, use the current date as a default
  @Type(() => Date) // converts input to date
  @IsDate()
  date?: Date;

  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  branchName: string;

  @IsNotEmpty()
  @IsString()
  supplierName: string;

  @IsString()
  statusName: string;

  @IsNotEmpty()
  @IsString()
  currencyName: string;

  @IsNotEmpty()
  @ValidateNested({ each: true }) // Validates each element in the array
  @Type(() => CreatePurchaseItemDto) // Transforms each element to CreatePurchaseItemDto
  purchaseItemsDtos: CreatePurchaseItemDto[];
}
