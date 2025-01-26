import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

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
  @IsNumber()
  total_items: number; // Total items in stock for this product item

  @IsNotEmpty()
  @IsString()
  name: string; // Name of the product item

  @IsNotEmpty()
  @IsNumber()
  product_id: number; // Foreign key linking to the parent product (numeric type)
}