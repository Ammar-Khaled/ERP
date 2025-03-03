import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVariationDto {
  @IsNotEmpty({ message: 'The name must not be empty.' })
  @IsString({ message: 'The name must be a string.' })
  name: string;
}
