import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { supplierProviders } from './suppliers.providers';
import { DatabaseModule } from '../common/database.module';
import { addressProviders } from '../common/address.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [SupplierController],
  providers: [...supplierProviders, ...addressProviders, SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
