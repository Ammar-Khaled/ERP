import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateTreasuryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
