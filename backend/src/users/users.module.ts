import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { userProviders } from './users.providers';
import { DatabaseModule } from '../common/database.module';
import { addressProviders } from '../common/address.providers';
import { roleProviders } from '../roles/roles.providers';
import { branchesProviders } from '../branches/branches.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    ...userProviders,
    ...addressProviders,
    ...roleProviders,
    ...branchesProviders,
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
