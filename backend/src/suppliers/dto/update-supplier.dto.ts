import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto';
import { OmitType } from '@nestjs/swagger';
import { UpdateAddressDto } from '../../common/dtos/update-address.dto';

export class UpdateSupplierDto extends PartialType(
  OmitType(CreateSupplierDto, ['address'] as const),
) {
  address?: UpdateAddressDto;
}
