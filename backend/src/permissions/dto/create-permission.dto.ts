import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  controller: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
