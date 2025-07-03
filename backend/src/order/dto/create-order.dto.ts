import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { CreateOrderItemDto } from 'src/order/dto/create-order_item.dto';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsNotEmpty()
  @IsNumber()
  branchId: number;

  @IsNotEmpty()
  @IsNumber()
  inventoryId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsOptional()
  @IsNumber()
  couponId?: number;

  @IsNotEmpty()
  @IsNumber()
  currencyId: number;

  @IsNotEmpty()
  @IsArray()
  items: CreateOrderItemDto[];
}
