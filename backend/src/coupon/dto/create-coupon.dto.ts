import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  start_date: string;

  @IsString()
  @IsNotEmpty()
  end_date: string;

  @IsNumber()
  @IsNotEmpty()
  discount_percentage: number;

  @IsNumber()
  @IsNotEmpty()
  max_allowed: number;

  @IsNumber()
  @IsNotEmpty()
  current_usage: number;

  @IsNumber()
  @IsNotEmpty()
  number_of_usage_time_per_user: number;

  @IsNumber()
  @IsNotEmpty()
  min_invoice_total: number;

  @IsBoolean()
  isActive;
}
