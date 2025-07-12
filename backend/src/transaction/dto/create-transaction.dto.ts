import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  transaction_date: string;

  @IsNotEmpty()
  @IsString()
  payment_method: string;

  @IsOptional()
  @IsNumber()
  treasury_id?: number;

  @IsNotEmpty()
  @IsNumber()
  added_by: number;

  @IsOptional()
  @IsNumber()
  account_id?: number;

  @IsOptional()
  @IsNumber()
  purchase_id?: number;

  @IsOptional()
  @IsNumber()
  order_id?: number;
}
