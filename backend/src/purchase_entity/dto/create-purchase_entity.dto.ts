import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreatePurchaseEntityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsPositive()
  unitPrice: number;
}
