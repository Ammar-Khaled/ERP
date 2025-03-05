import { Module } from '@nestjs/common';
import { OrderItemService } from './order_item.service';
import { OrderItemController } from './order_item.controller';
import { DatabaseModule } from 'src/common/database.module';
import { orderItemProviders } from './order_item.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [OrderItemController],
  providers: [OrderItemService, ...orderItemProviders ],
})
export class OrderItemModule {}
