import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'The name must not be empty.' })
  @IsString({ message: 'The name must be a string.' })
  name: string;

  // get Arabic name
  @IsOptional()
  @IsString({ message: 'The Arabic name must be a string.' })
  nameAr?: string;

  @IsOptional()
  @IsString({ message: 'The description must be a string.' })
  description?: string;

  // get Arabic description
  @IsOptional()
  @IsString({ message: 'The Arabic description must be a string.' })
  descriptionAr?: string;

  @IsNotEmpty({ message: 'The branch ID must not be empty.' })
  branchId: number;
}
