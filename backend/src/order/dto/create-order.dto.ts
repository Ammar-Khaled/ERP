import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';
import { CreateOrderItemDto } from 'src/order_item/dto/create-order_item.dto';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsNotEmpty()
  @IsNumber()
  branch_id: number;

  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  client_id: number;

  @IsNotEmpty()
  @IsNumber()
  status_id: number;

  @IsOptional()
  @IsNumber()
  coupon_id: number;

  @IsNotEmpty()
  @IsNumber()
  currency_id: number;

  @IsNotEmpty()
  @IsArray()
  items: CreateOrderItemDto[];
}
