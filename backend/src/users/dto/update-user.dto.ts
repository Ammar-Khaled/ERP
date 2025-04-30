import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { UpdateAddressDto } from '../../common/dtos/update-address.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['address'] as const),
) {
  address?: UpdateAddressDto;
}
