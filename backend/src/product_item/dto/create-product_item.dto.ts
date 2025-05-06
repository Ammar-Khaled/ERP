import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateVariationOptionDto } from 'src/variation_option/dto/create-variation_option.dto';

export class CreateProductItemDto {
  @IsNotEmpty()
  @IsString()
  barcode: string; // Barcode of the product item

  @IsNotEmpty()
  @IsNumber()
  cost: number; // Cost price of the product item

  @IsNotEmpty()
  @IsNumber()
  price: number; // Selling price of the product item

  @IsOptional() // Photos may not always be provided
  @IsArray()
  @IsString({ each: true })
  photos?: string[]; // Array of photo URLs or paths

  @IsNotEmpty()
  @IsString()
  name: string; // Name of the product item

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  // Add this to specify multiple variation options for the product item
  @IsArray()
  @IsOptional()
  variationOptions?: CreateVariationOptionDto[]; // Array of variation options to associate with this product item
}
