import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule
import { currencyProviders } from './currency.providers';

@Module({
  imports: [DatabaseModule], // Include the DatabaseModule for DataSource injection
  controllers: [CurrencyController],
  providers: [...currencyProviders, CurrencyService], // Add currencyProviders and CurrencyService to the module
  exports: [CurrencyService], // Export CurrencyService if other modules need it
})
export class CurrencyModule {}
