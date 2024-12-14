import { IsString, IsEmail, IsPhoneNumber, IsInt } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone_number: string;

  @IsInt()
  address_id: number; // Reference to Address ID
}