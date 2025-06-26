import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStatusDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Arabic name
  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Arabic description
  @IsOptional()
  @IsString()
  descriptionAr?: string;
}
