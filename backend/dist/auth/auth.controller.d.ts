import { AuthService } from './auth.service';
import { UserSignInDto } from "./dto/user-sign-in.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(userSignInDto: UserSignInDto): Promise<{
        access_token: string;
    }>;
}
