import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { clientsProviders } from './clients.providers';
import { DatabaseModule } from '../common/database.module';  // Import DatabaseModule
import { addressProviders } from '../common/address.providers';  // If you need address-related providers
import { ResponseService } from 'src/common/response.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],  
  controllers: [ClientsController],
  providers: [...clientsProviders, ...addressProviders, ClientsService],  // Add necessary providers
  exports: [ClientsService],  // Export ClientsService if needed
})
export class ClientsModule {}