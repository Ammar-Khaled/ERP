import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { userProviders } from './users.providers';
import { DatabaseModule } from '../common/database.module';
import { addressProviders } from '../common/address.providers';
import { rolesProviders } from '../roles/roles.providers';
import { branchesProviders } from '../branches/branches.providers';
import { DatabaseLoggerService } from '../logging/database-logger.service';
import { logRepositoryProvider } from '../logging/log.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    ...userProviders,
    ...addressProviders,
    ...rolesProviders,
    ...branchesProviders,
    UsersService,
    DatabaseLoggerService,
    logRepositoryProvider,
  ],
  exports: [UsersService],
})
export class UsersModule {}
