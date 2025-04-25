import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class UpdatePurchaseItemDto {
  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Please enter a valid number!' })
  @Min(1, { message: 'Number of items should be at least 1!' })
  number_of_items?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Please enter a valid number!' })
  @IsPositive({ message: 'Please enter a positive number!' })
  discount?: number;
}
