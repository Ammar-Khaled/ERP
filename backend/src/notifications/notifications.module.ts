import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { DatabaseModule } from 'src/common/database.module';
import { notificationsProviders } from './notifications.providers';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [
    ...notificationsProviders,
    NotificationsService,
    NotificationsGateway,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
