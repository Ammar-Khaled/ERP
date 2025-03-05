import { Module } from '@nestjs/common';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { DatabaseModule } from '../common/database.module';
import { addressProviders } from '../common/address.providers';
import { branchesProviders } from './branches.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [BranchesController],
  providers: [BranchesService, ...branchesProviders, ...addressProviders],
})
export class BranchesModule {}
