import { IsInt, IsPositive } from 'class-validator';

export class TransferProductItemsDto {
  @IsInt()
  sourceInventoryId: number;

  @IsInt()
  targetInventoryId: number;

  @IsInt()
  productItemId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}
