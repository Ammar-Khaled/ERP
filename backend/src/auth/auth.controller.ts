import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignInDto } from './dto/user-sign-in.dto';
import { Public } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() userSignInDto: UserSignInDto) {
    return this.authService.signIn(
      userSignInDto.usernameOrEmail,
      userSignInDto.password,
    );
  }
}
