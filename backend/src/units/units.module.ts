import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { unitsProviders } from './units.providers';
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule

@Module({
  imports: [DatabaseModule], // Include the DatabaseModule for DataSource injection
  controllers: [UnitsController],
  providers: [...unitsProviders, UnitsService], // Add unitsProviders to the module
  exports: [UnitsService], // Export UnitsService if other modules need it
})
export class UnitsModule {}