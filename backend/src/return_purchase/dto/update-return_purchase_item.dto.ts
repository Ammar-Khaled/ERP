import { IsNumber, IsPositive } from 'class-validator';

export class UpdateReturnPurchaseItemDto {
  // Only the number of returned items can be updated
  @IsNumber()
  @IsPositive()
  numberOfReturned: number;
}
