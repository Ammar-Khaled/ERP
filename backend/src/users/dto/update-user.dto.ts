import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UpdateAddressDto } from '../../common/dtos/update-address.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['address'] as const),
) {
  address?: UpdateAddressDto;
}
