import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, ValidateNested, IsPositive } from 'class-validator';
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

  @IsOptional()
  @IsInt({ message: 'The address_id must be an integer.' })
  @IsPositive({ message: 'The address_id must be a positive integer.' }) // Ensure it's a positive integer
  address_id?: number;  // Optionally pass address_id for the foreign key
}