import { IsNotEmpty, IsString } from 'class-validator';

export class UserSignInDto {
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
