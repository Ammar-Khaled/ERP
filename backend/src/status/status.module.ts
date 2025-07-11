import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { DatabaseModule } from 'src/common/database.module';
import { statusProviders } from './status.providers';
import { StatusSeeder } from './status.seeder';

@Module({
  imports: [DatabaseModule],
  controllers: [StatusController],
  providers: [StatusService, StatusSeeder, ...statusProviders],
})
export class StatusModule {}
