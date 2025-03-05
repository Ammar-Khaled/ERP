import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
  } from 'class-validator';
import { STATUS } from '../entities/order.entity';
import { OrderItem } from 'src/order_item/entities/order_item.entity';

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    date: string;

    @IsNotEmpty()
    @IsNumber()
    total_amount: number;

    @IsOptional()
    @IsBoolean()
    is_returned: boolean;

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
    @IsEnum(STATUS)
    status: STATUS;

    @IsOptional()
    @IsNumber()
    coupon_id: number;

    @IsNotEmpty()
    @IsNumber()
    currency_id: number;

    @IsNotEmpty()
    @IsArray()
    items: OrderItem[];
}
