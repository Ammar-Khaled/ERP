import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateInventoryDto } from './create-inventory.dto';
import { UpdateAddressDto } from '../../common/dtos/update-address.dto';

export class UpdateInventoryDto extends PartialType(
  OmitType(CreateInventoryDto, ['address', 'branchId'] as const),
) {
  address?: UpdateAddressDto;
}
