import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePurchaseInventoryDto {
  @IsNotEmpty()
  @IsInt()
  purchaseEntityId: number;

  @IsNotEmpty()
  @IsInt()
  inventoryId: number;

  @IsOptional()
  @IsInt()
  amount: number = 0;
}
