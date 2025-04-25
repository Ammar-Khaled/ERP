import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateReturnItemDto {
  @IsNotEmpty({ message: 'The number of items must not be empty.' })
  @IsInt({ message: 'The number of items must be an integer.' })
  @Min(1, { message: 'The number of items must be at least 1.' })
  numberOfItems: number;

  @IsNotEmpty({ message: 'The order item ID must not be empty.' })
  @IsInt({ message: 'The order item ID must be an integer.' })
  orderItemId: number;
}
