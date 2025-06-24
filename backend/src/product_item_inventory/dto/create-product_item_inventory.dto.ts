import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductItemInventoryDto {
  @IsNotEmpty()
  @IsNumber()
  productItemId: number;

  @IsNotEmpty()
  @IsNumber()
  inventoryId: number;

  @IsOptional()
  @IsNumber()
  numberOfValid?: number;

  @IsOptional()
  @IsNumber()
  numberOfDamaged?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  minimumThreshold?: number;
}
