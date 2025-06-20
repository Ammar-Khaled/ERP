import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCurrencyDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Name of the currency

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsNotEmpty()
  @IsString()
  symbol: string; // Symbol of the currency
}
