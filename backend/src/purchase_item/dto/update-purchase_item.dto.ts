import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseItemDto } from './create-purchase_item.dto';

export class UpdatePurchaseItemDto extends PartialType(CreatePurchaseItemDto) {}
