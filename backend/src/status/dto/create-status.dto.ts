import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStatusDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  name: string;

  // Arabic name
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nameAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  description?: string;

  // Arabic description
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descriptionAr?: string;
}
