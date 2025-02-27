import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { DatabaseModule } from '../common/database.module';
import { permissionProviders } from './permissions.providers';
import { rolesProviders } from '../roles/roles.providers';

@Module({
  imports: [DatabaseModule],
  providers: [PermissionService, ...permissionProviders, ...rolesProviders],
  controllers: [PermissionController],
})
export class PermissionModule {}
