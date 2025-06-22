import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { userProviders } from '../users/users.providers';
import { DatabaseModule } from '../common/database.module';
import { config } from 'dotenv';
import { MailerModule } from '@nestjs-modules/mailer';

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
    MailerModule.forRoot({
      /*
        Using SMTP host configuration
        Notes to pay attention to:
        - This free service is limited to a number of emails/day
        - MAIL_FROM is similar to `auth.user` for now, but that is not fully professional
        - MAIL_APP_PASSWORD is a generated password for the user google account
        - Ensure that the environment variables are set correctly in your .env file
      */
      transport: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_APP_PASSWORD,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM}>`,
      },
    }),
  ],
  providers: [
    AuthService,
    ...userProviders,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
