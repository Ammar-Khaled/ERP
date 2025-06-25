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

  async createPasswordResetToken(email: string) {
    // Check the existence of the user
    const user = await this.usersService.findOneByCondition({ email });
    if (!user) {
      throw new UnauthorizedException('User email is not found!');
    }

    // Create a reset token
    const payload = {sub: user.id, purpose: 'password-reset'};
    const resetToken = await this.jwtService.signAsync(
      payload, { 
        expiresIn: '15m',
        secret: 'reset-password-secret', // Use a different secret for reset tokens
      }, 
    );

    return resetToken;
  }

  async forgotPassword(email: string) {
    // Generate a reset token
    const resetToken = await this.createPasswordResetToken(email);
    
    // Send the reset email
    // Note: Ensure that the environment variable FRONTEND_URL is set to your frontend application URL
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL environment variable is not set');
    }
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    const message = `Click the link to reset your password: \n${resetLink}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset The Password',
      text: message,
    });
  }
}
