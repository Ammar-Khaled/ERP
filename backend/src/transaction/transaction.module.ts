import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { transactionProviders } from './transaction.providers';
import { DatabaseModule } from 'src/common/database.module';
import { userProviders } from 'src/users/users.providers';
import { treasuryProviders } from 'src/treasury/treasury.providers';
import { accountProviders } from 'src/accounts/account.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [TransactionController],
  providers: [
    ...transactionProviders,
    ...userProviders,
    ...treasuryProviders,
    ...accountProviders,
    TransactionService,
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
