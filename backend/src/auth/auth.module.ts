import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { userProviders } from '../users/users.providers';
import { DatabaseModule } from '../common/database.module';
import { config } from 'dotenv';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

config();

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
  ],
  providers: [
    AuthService,
    ...userProviders,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
