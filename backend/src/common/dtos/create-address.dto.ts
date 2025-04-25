import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty({ message: 'Street address is required' })
  @IsString({ message: 'Street must be a string' })
  street: string;

  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  city: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @IsOptional()
  @IsString({ message: 'Zip code must be a string' })
  zipCode?: string;

  @IsNotEmpty({ message: 'Country must not be empty.' })
  @IsString({ message: 'Country must be a string' })
  country: string;

  @IsOptional()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  latitude: number;
}
