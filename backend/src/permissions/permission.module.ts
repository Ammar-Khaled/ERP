import { Module } from '@nestjs/common';
import { Permission } from './permission.entity';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { DataSource } from 'typeorm';
import { DatabaseModule } from '../common/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    PermissionService,
    {
      provide: 'PERMISSION_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(Permission),
      inject: ['DATA_SOURCE'],
    },
  ],
  controllers: [PermissionController],
})
export class PermissionModule {}
