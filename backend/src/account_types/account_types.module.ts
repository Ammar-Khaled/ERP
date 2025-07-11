import { Module } from '@nestjs/common';
import { AccountTypesController } from './account_types.controller';
import { AccountTypesService } from './account_types.service';
import { accountTypesProviders } from './account_types.providers';
import { DatabaseModule } from '../common/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountTypesController],
  providers: [...accountTypesProviders, AccountTypesService],
  exports: [AccountTypesService],
})
export class AccountTypesModule {}
