import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { DataSource } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { DatabaseModule } from '../common/database.module';
import { addressProviders } from '../common/address.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [BranchesController],
  providers: [
    BranchesService,
    ...addressProviders,
    {
      provide: 'BRANCH_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(Branch),
      inject: ['DATA_SOURCE'],
    },
  ],
})
export class BranchesModule {}
