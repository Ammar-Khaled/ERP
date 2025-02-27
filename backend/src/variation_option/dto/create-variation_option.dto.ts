import { isNotEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateVariationDto } from 'src/variation/dto/create-variation.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVariationOptionDto {
  @IsNotEmpty({ message: 'The name must not be empty.' })
  @IsString({ message: 'The name must be a string.' })
  value: string;

  @IsNotEmpty({ message: 'The variation must not be empty.' })
  variation: CreateVariationDto;
}
