import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Name of the unit

  @IsOptional()
  @IsString()
  description?: string; // Description of the unit

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true; // Indicates if the unit is active (optional, defaults to true)
}