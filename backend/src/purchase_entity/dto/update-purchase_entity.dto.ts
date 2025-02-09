import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseEntityDto } from './create-purchase_entity.dto';

export class UpdatePurchaseEntityDto extends PartialType(CreatePurchaseEntityDto) {}
