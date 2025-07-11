import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { SeederService } from './services/seeder.service';
import { seederProviders } from './seeder.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...seederProviders, SeederService],
  exports: [SeederService],
})
export class SeederModule {}
