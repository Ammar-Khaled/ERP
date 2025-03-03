import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliersController';
import { supplierProviders } from './suppliers.providers';
import { DatabaseModule } from '../common/database.module';
import { addressProviders } from '../common/address.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [SuppliersController],
  providers: [...supplierProviders, ...addressProviders, SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
