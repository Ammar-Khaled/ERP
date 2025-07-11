import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { accountProviders } from './account.providers';
import { DatabaseModule } from 'src/common/database.module';
import { userProviders } from 'src/users/users.providers';
import { accountTypesProviders } from 'src/account_types/account_types.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountController],
  providers: [
    ...accountProviders,
    ...userProviders,
    ...accountTypesProviders,
    AccountService,
  ],
  exports: [AccountService],
})
export class AccountModule {}
