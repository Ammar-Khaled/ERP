import { PartialType } from '@nestjs/swagger';
import { CreateReturnPurchaseDto } from './create-return_purchase.dto';

export class UpdateReturnPurchaseDto extends PartialType(CreateReturnPurchaseDto) {}
