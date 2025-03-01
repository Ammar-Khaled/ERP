import { IsInt, IsPositive } from 'class-validator';

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

  @IsInt()
  @IsPositive()
  quantity: number;
}
