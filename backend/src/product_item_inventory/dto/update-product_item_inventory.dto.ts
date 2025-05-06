import { IsNumber, IsOptional } from 'class-validator';

export class UpdateProductItemInventoryDto {
  @IsOptional()
  @IsNumber()
  numberOfValid?: number;

  @IsOptional()
  @IsNumber()
  numberOfDamaged?: number;
}
