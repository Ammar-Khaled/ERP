import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}

// export class BaseUpdateClientDto extends PartialType(
//   // Exclude 'address' from CreateClientDto
//   class {
//     name: string;
//     email: string;
//     phone_number: string;
//   },
// ) {}
//
// // Create the actual update DTO with the correct address type
// export class UpdateClientDto extends BaseUpdateClientDto {
//   @IsOptional()
//   @ValidateNested()
//   @Type(() => UpdateAddressDto)
//   address?: UpdateAddressDto;
// }
