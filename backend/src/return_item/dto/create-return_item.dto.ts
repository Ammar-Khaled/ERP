import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateReturnItemDto {
  @IsNotEmpty({ message: 'The name must not be empty.' })
  @IsString({ message: 'The name must be a string.' })
  name: string;

  @IsNotEmpty({ message: 'The number of items must not be empty.' })
  @IsInt({ message: 'The number of items must be an integer.' })
  @Min(1, { message: 'The number of items must be at least 1.' })
  number_of_items: number;

  @IsNotEmpty({ message: 'The order item ID must not be empty.' })
  @IsInt({ message: 'The order item ID must be an integer.' })
  order_item_id: number;
}
