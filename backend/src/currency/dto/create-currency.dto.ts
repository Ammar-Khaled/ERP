import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCurrencyDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Name of the currency

  @IsNotEmpty()
  @IsString()
  symbol: string; // Symbol of the currency
}