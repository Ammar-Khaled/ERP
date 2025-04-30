import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  numberOfItems: number;

  @IsNotEmpty()
  @IsNumber()
  productItemId: number;
}
