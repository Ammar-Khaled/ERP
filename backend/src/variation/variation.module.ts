import { Module } from '@nestjs/common';
import { VariationService } from './variation.service';
import { VariationController } from './variation.controller';
import { variationsProviders } from './variation.providers';
import { DatabaseModule } from '../common/database.module'; // Import DatabaseModule

@Module({
  imports: [DatabaseModule],
  controllers: [VariationController],
  providers: [...variationsProviders, VariationService],
  exports: [VariationService],
})
export class VariationModule {}
