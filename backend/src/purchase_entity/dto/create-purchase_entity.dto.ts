import { IsNotEmpty, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreatePurchaseEntityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsPositive()
  unit_price: number;
}
