import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, ValidateNested } from 'class-validator';
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
  phone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;

  @IsOptional()
  @IsInt({ message: 'The address_id must be an integer.' })
  address_id?: number;  // This is the new property for address_id
}