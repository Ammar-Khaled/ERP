import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductItemInventoryDto {
  @IsOptional()
  @IsNumber()
  numberOfValid?: number;

  @IsOptional()
  @IsNumber()
  numberOfDamaged?: number;

  @IsNotEmpty()
  @IsNumber()
  productItemId: number;

  @IsNotEmpty()
  @IsNumber()
  inventoryId: number;
}
