import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  account_number: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsNumber()
  start_balance: number;

  @IsNotEmpty()
  @IsNumber()
  account_type_id: number;

  @IsNotEmpty()
  @IsNumber()
  added_by: number;
}
