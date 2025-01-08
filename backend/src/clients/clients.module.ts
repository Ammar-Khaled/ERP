import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { clientsProviders } from './clients.providers';
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule
import { addressProviders } from '../common/address.providers'; // If you need address-related providers

@Module({
  imports: [DatabaseModule],
  controllers: [ClientsController],
  providers: [...clientsProviders, ...addressProviders, ClientsService], // Add necessary providers
  exports: [ClientsService], // Export ClientsService if needed
})
export class ClientsModule {}
