import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductItemDto } from 'src/product_item/dto/create-product_item.dto';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Product name

  @IsNotEmpty()
  @IsString()
  type: string; // Product type

  @IsNotEmpty()
  @IsNumber()
  quantity: number; // Product quantity

  @IsNotEmpty()
  @IsString()
  mainPhoto: string; // Main photo URL or path

  @IsNotEmpty()
  @IsNumber()
  branch_id: number; // Foreign key for branch

  @IsOptional() // Optional because not all products might have a brand
  @IsString()
  brand?: string; // Brand of the product (optional)

  @IsNotEmpty()
  @IsNumber()
  category_id: number; // Foreign key for category

  @IsOptional() // Optional because it might default to true
  @IsBoolean()
  isActive?: boolean = true; // Whether the product is active (optional, default is true)

  @IsNotEmpty()
  @IsNumber()
  unit_id: number; // Foreign key for unit

  @IsNotEmpty()
  @IsNumber()
  currency_id: number; // Foreign key for currency

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductItemDto)
  productItems: CreateProductItemDto[];
}
