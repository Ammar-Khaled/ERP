import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTreasuryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  treasury_type: string;

  @IsNotEmpty()
  @IsNumber()
  starting_balance: number;

  @IsNotEmpty()
  @IsNumber()
  added_by: number;
}
