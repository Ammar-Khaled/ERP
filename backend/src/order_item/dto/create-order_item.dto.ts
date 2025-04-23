import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderItemDto {

  @IsNotEmpty()
  @IsNumber()
  number_of_items: number;

  @IsNotEmpty()
  @IsNumber()
  product_item_id: number;
}
