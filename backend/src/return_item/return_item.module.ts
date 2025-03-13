import { Module } from '@nestjs/common';
import { ReturnItemService } from './return_item.service';
import { ReturnItemController } from './return_item.controller';
import { returnItemProviders } from './return_item.provider';
import { DatabaseModule } from 'src/common/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ReturnItemController],
  providers: [ReturnItemService, ...returnItemProviders],
})
export class ReturnItemModule {}
