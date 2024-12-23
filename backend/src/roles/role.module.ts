import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { DatabaseModule } from '../common/database.module';
import { userProviders } from '../users/users.providers';
import { permissionProviders } from '../permissions/permissions.providers';
import { roleProviders } from './roles.providers';

@Module({
  imports: [DatabaseModule],
  providers: [
    RoleService,
    ...roleProviders,
    ...userProviders,
    ...permissionProviders,
  ],
  controllers: [RoleController],
})
export class RoleModule {}
