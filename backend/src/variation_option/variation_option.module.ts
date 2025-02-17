import { Module } from '@nestjs/common';
import { VariationOptionService } from './variation_option.service';
import { VariationOptionController } from './variation_option.controller';
import { variationOptionsProviders } from './variation_option.providers';
import { variationsProviders } from 'src/variation/variation.providers';
import { DatabaseModule } from 'src/common/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VariationOptionController],
  providers: [
    ...variationOptionsProviders,
    ...variationsProviders,
    VariationOptionService,
  ],
  exports: [VariationOptionService],
})
export class VariationOptionModule {}
