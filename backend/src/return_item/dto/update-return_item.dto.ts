import { PartialType } from '@nestjs/swagger';
import { CreateReturnItemDto } from './create-return_item.dto';

export class UpdateReturnItemDto extends PartialType(CreateReturnItemDto) {}
