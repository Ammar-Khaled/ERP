import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateReturnItemDto } from './create-return_item.dto';

export class CreateReturnDto {
  // get from the user: optional date, reason, return item dtos, order id, status id

  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reasonAr?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true, always: true })
  @Type(() => CreateReturnItemDto)
  returnItemDtos: CreateReturnItemDto[];

  @IsNotEmpty()
  @IsInt()
  orderId: number;

  @IsNotEmpty()
  @IsInt()
  statusId: number;
}
