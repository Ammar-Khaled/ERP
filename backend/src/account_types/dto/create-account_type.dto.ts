import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAccountTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
