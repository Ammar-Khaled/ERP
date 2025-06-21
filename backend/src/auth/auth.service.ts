import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async signIn(
    usernameOrEmail: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const condition = usernameOrEmail.includes('@')
      ? { email: usernameOrEmail }
      : { username: usernameOrEmail };

    const user = await this.usersService.findOneByCondition(condition);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const match = await compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('User is blocked');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };

    delete user.password;

    return {
      token: await this.jwtService.signAsync(payload),
      user: user,
    };
  }

  async forgotPassword(email: string) {
    // Check the existence of the user
    const user = await this.usersService.findOneByCondition({email});
    if (!user) {
      throw new UnauthorizedException('User email is not found!');
    }

    // Create a reset token
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: '1h' }, // Token valid for 1 hour
    );

    // Send the reset email
    // Note: Ensure that the environment variable FRONTEND_URL is set to your frontend application URL
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL environment variable is not set');
    }
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    //# ToFix: Just use the reset link without sending the token explicitly!
    const message = `Click the link to reset your password: \n${resetLink}
                    \n\nThe access token: \n${resetToken}`;

    // console.log(user.email); // debug

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset The Password',
      text: message,
    });

    // return "Check your email for the reset link.";
  }
}