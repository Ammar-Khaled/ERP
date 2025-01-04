import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from 'src/common/dtos/create-address.dto'; // Assuming you have a CreateAddressDto

export class CreateClientDto {
  @IsNotEmpty({ message: 'The name must not be empty.' })
  @IsString({ message: 'The name must be a string.' })
  name: string;

  @IsNotEmpty({ message: 'The Email must not be empty.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsOptional()
  @IsString({ message: 'The phone must be a string.' })
  phone_number?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto; // Allow for an embedded address object, optional
}
