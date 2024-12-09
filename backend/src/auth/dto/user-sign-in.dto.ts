import { IsString, IsNotEmpty } from 'class-validator';

export class UserSignInDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}