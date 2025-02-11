import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseRequestDto } from './create-purchase_request.dto';

export class UpdatePurchaseRequestDto extends PartialType(CreatePurchaseRequestDto) {}
