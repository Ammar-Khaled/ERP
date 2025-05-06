import { Module } from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { InventoriesController } from './inventories.controller';
import { inventoriesProviders } from './inventories.providers';
import { addressProviders } from '../common/address.providers';
import { branchesProviders } from '../branches/branches.providers';
import { DatabaseModule } from '../common/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InventoriesController],
  providers: [
    InventoriesService,
    ...inventoriesProviders,
    ...addressProviders,
    ...branchesProviders,
  ],
})
export class InventoriesModule {}
