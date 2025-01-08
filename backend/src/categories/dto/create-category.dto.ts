import {
    IsNotEmpty,
    IsOptional,
    IsString,
  } from 'class-validator';
  
  export class CreateCategoryDto {
    @IsNotEmpty({ message: 'The name must not be empty.' })
    @IsString({ message: 'The name must be a string.' })
    name: string;
  
    @IsOptional()
    @IsString({ message: 'The description must be a string.' })
    description?: string;
  
    @IsNotEmpty({ message: 'The branch ID must not be empty.' })
    branch_id: number;
  }