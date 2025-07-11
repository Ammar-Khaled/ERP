import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class UpdatePurchaseItemDto {
  @IsNotEmpty()
  @IsString()
  purchaseEntityName: string;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Please enter a valid number!' })
  @Min(1, { message: 'Number of items should be at least 1!' })
  numberOfItems?: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Please enter a valid number!' })
  @IsPositive({ message: 'Please enter a positive number!' })
  discount?: number;
}
