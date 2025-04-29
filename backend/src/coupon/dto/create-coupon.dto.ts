import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsNumber()
  @IsNotEmpty()
  discountPercentage: number;

  @IsNumber()
  @IsNotEmpty()
  maxAllowed: number;

  @IsNumber()
  @IsNotEmpty()
  currentUsage: number;

  @IsNumber()
  @IsNotEmpty()
  numberOfUsageTimePerUser: number;

  @IsNumber()
  @IsNotEmpty()
  minInvoiceTotal: number;

  @IsBoolean()
  isActive;
}
