import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductItemInventoryDto } from './create-product_item_inventory.dto';

export class UpdateProductItemInventoryDto extends PartialType(
  OmitType(CreateProductItemInventoryDto, ['inventoryId', 'productItemId']),
) {}

// given values of numberOfValid and numberOfDamaged are set not added, and reflected to the product item table and inventory table
