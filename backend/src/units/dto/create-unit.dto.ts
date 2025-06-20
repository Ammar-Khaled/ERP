import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Name of the unit

  // Arabic name
  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  description?: string; // Description of the unit

  // Arabic description
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true; // Indicates if the unit is active (optional, defaults to true)
}
