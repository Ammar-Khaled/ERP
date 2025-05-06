import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class TransferProductItemsDto {
  @IsInt()
  @IsPositive()
  sourceInventoryId: number;

  @IsInt()
  @IsPositive()
  targetInventoryId: number;

  @IsInt()
  @IsPositive()
  productItemId: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? value : 0))
  @IsInt()
  @IsPositive()
  numberOfValid?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? value : 0))
  @IsInt()
  @IsPositive()
  numberOfDamaged?: number;
}
