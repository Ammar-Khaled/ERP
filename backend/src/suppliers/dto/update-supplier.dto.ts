import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSupplierDto } from './create-supplier.dto';
import { UpdateAddressDto } from '../../common/dtos/update-address.dto';

export class UpdateSupplierDto extends PartialType(
  OmitType(CreateSupplierDto, ['address'] as const),
) {
  address?: UpdateAddressDto;
}
