import { DataSource } from 'typeorm';
import { Notification } from './entities/notification.entity';

export const notificationsProviders = [
  {
    provide: 'NOTIFICATION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Notification),
    inject: ['DATA_SOURCE'],
  },
];
