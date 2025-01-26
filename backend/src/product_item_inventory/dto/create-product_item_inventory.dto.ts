import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductItemInventoryDto {
  @IsNotEmpty()
  @IsNumber()
  number_of_items: number; // Number of items in inventory

  @IsNotEmpty()
  @IsNumber()
  number_of_damaged: number; // Number of damaged items

  @IsNotEmpty()
  @IsNumber()
  product_item_id: number; // Foreign key for ProductItem

  @IsNotEmpty()
  @IsNumber()
  inventory_id: number; // Foreign key for Inventory
}
