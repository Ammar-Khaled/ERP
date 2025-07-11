import { Module } from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { TreasuryController } from './treasury.controller';
import { treasuryProviders } from './treasury.providers';
import { DatabaseModule } from 'src/common/database.module';
import { userProviders } from 'src/users/users.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [TreasuryController],
  providers: [...treasuryProviders, ...userProviders, TreasuryService],
  exports: [TreasuryService],
})
export class TreasuryModule {}
