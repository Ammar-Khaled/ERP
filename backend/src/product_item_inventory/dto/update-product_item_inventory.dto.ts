import { PartialType } from '@nestjs/swagger';
import { CreateProductItemInventoryDto } from './create-product_item_inventory.dto';

export class UpdateProductItemInventoryDto extends PartialType(CreateProductItemInventoryDto) {}
