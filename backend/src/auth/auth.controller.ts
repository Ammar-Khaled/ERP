import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
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

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return {
      message: 'Check your email for the password reset link.',
    };
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
    return {
      message: 'Your password has been successfully reset.',
    };
  }
}
