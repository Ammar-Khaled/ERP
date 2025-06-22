import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductItemDto } from 'src/product_item/dto/create-product_item.dto';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string; // Product name

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsNotEmpty()
  @IsNumber()
  branchId: number; // Foreign key for branch

  @IsOptional() // Optional because not all products might have a brand
  @IsString()
  brand?: string; // Brand of the product (optional)

  @IsNotEmpty()
  @IsNumber()
  categoryId: number; // Foreign key for category

  @IsOptional() // Optional because it might default to true
  @IsBoolean()
  isActive?: boolean = true; // Whether the product is active (optional, default is true)

  @IsNotEmpty()
  @IsNumber()
  unitId: number; // Foreign key for unit

  @IsNotEmpty()
  @IsNumber()
  currencyId: number; // Foreign key for currency

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductItemDto)
  productItems?: CreateProductItemDto[];
}
