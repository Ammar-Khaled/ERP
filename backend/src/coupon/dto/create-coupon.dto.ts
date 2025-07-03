import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsNumber()
  @IsNotEmpty()
  discountPercentage: number;

  @IsNumber()
  @IsNotEmpty()
  maxAllowed: number;

  @IsNumber()
  @IsNotEmpty()
  numberOfUsageTimePerUser: number;

  @IsNumber()
  @IsNotEmpty()
  minInvoiceTotal: number;

  @IsBoolean()
  isActive;
}
