import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignInDto } from "./dto/user-sign-in.dto";
import { Public } from "./auth.guard";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() userSignInDto: UserSignInDto) {
        return this.authService.signIn(userSignInDto.username, userSignInDto.password);
    }
}
