import { PartialType } from '@nestjs/swagger';
import { CreateVariationOptionDto } from './create-variation_option.dto';

export class UpdateVariationOptionDto extends PartialType(CreateVariationOptionDto) {}
