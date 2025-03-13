import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
}
