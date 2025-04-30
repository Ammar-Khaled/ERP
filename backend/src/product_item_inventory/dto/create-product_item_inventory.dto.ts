import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductItemInventoryDto {
  @IsNotEmpty()
  @IsNumber()
  numberOfValid: number; // Number of items in inventory

  @IsNotEmpty()
  @IsNumber()
  numberOfDamaged: number; // Number of damaged items

  @IsNotEmpty()
  @IsNumber()
  productItemId: number; // Foreign key for ProductItem

  @IsNotEmpty()
  @IsNumber()
  inventoryId: number; // Foreign key for Inventory
}
