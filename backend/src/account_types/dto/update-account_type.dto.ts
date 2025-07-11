import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAccountTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
