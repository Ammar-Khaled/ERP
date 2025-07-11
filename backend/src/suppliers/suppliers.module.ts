import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { supplierProviders } from './suppliers.providers';
import { DatabaseModule } from '../common/database.module';
import { addressProviders } from '../common/address.providers';
import { branchesProviders } from '../branches/branches.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [SuppliersController],
  providers: [
    ...supplierProviders,
    ...addressProviders,
    SuppliersService,
    ...branchesProviders,
  ],
  exports: [SuppliersService],
})
export class SuppliersModule {}
