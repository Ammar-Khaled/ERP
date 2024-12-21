import { Module } from '@nestjs/common';
import { Role } from './role.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { DataSource } from 'typeorm';
import { DatabaseModule } from '../common/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    RoleService,
    {
      provide: 'ROLE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Role),
      inject: ['DATA_SOURCE'],
    },
  ],
  controllers: [RoleController],
})
export class RoleModule {}
