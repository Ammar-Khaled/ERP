import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty({ message: 'Street address is required' })
  @IsString({ message: 'Street must be a string' })
  street: string;

  // Arabic street
  @IsOptional()
  @IsString({ message: 'Arabic street must be a string' })
  streetAr?: string;

  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  city: string;

  // Arabic city
  @IsOptional()
  @IsString({ message: 'Arabic city must be a string' })
  cityAr?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  // Arabic state
  @IsOptional()
  @IsString({ message: 'Arabic state must be a string' })
  stateAr?: string;

  @IsOptional()
  @IsString({ message: 'Zip code must be a string' })
  zipCode?: string;

  @IsNotEmpty({ message: 'Country must not be empty.' })
  @IsString({ message: 'Country must be a string' })
  country: string;

  // Arabic country
  @IsOptional()
  @IsString({ message: 'Arabic country must be a string' })
  countryAr?: string;

  @IsOptional()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  latitude: number;
}
