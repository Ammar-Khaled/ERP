import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateReturnPurchaseItemDto } from './create-return_purchase_item.dto';

export class CreateReturnPurchaseDto {
  @IsOptional()
  @Type(() => Date)
  date?: Date;

  // English and Arabic reasons
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  reasonAr?: string;

  @IsNotEmpty()
  @IsNumber()
  purchaseRequestId: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true, always: true })
  @Type(() => CreateReturnPurchaseItemDto)
  returnPurchaseItemDtos: CreateReturnPurchaseItemDto[];

  @IsNotEmpty()
  @IsNumber()
  statusId: number;
}
