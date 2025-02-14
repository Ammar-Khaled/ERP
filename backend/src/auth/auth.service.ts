import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    username: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const user = await this.usersService.findOneByUsername(username);
    const match = await compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('User is blocked');
    }

    if (user.isDeleted) {
      throw new ConflictException('User is deleted');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
    };

    delete user.password;

    return {
      token: await this.jwtService.signAsync(payload),
      user: user,
    };
  }
}
