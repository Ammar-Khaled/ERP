import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateReturnPurchaseItemDto {
  @IsNotEmpty()
  @IsNumber()
  purchaseItemId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  numberOfReturned: number;
}
