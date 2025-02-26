import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreatePurchaseItemDto {
  @IsNotEmpty({ message: 'Purchase entity name must not be empty.' })
  @IsString({ message: 'Purchase entity name must be a string.' })
  purchaseEntityName: string;
  
  @IsNotEmpty()
  @IsNumber({ allowNaN: false }, { message: 'Please enter a valid number!' })
  @Min(1, { message: 'Number of items should be at least 1!' })
  number_of_items: number;

  @IsOptional()
  @IsNumber({ allowNaN: false }, { message: 'Please enter a valid number!' })
  @IsPositive({ message: 'Please enter a positive number!' })
  discount?: number;
}
