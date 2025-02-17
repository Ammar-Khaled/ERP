import { isNotEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVariationOptionDto {
  @IsNotEmpty({ message: 'The name must not be empty.' })
  @IsString({ message: 'The name must be a string.' })
  value: string;

  @IsNotEmpty({ message: 'The variation ID must not be empty.' })
  variation_id: number;
}
