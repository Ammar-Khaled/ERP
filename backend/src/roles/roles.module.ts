import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { DatabaseModule } from '../common/database.module';
import { userProviders } from '../users/users.providers';
import { permissionProviders } from '../permissions/permissions.providers';
import { rolesProviders } from './roles.providers';

@Module({
  imports: [DatabaseModule],
  providers: [
    RolesService,
    ...rolesProviders,
    ...userProviders,
    ...permissionProviders,
  ],
  controllers: [RolesController],
  exports: [RolesService], // Export RolesService
})
export class RolesModule {}
