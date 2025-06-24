import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATION_REPOSITORY')
    private notificationRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    const savedNotification =
      await this.notificationRepository.save(notification);

    // Send the notification via WebSocket
    if (createNotificationDto.userId) {
      this.notificationsGateway.sendNotificationToUser(
        createNotificationDto.userId,
        savedNotification,
      );
    } else {
      // If no specific user, send to all (admin notifications)
      this.notificationsGateway.sendNotificationToAll(savedNotification);
    }

    return savedNotification;
  }

  async createLowInventoryNotification(
    productItemId: number,
    quantity: number,
    productName: string,
    inventoryName: string,
  ) {
    return this.create({
      title: 'Low Inventory Alert',
      message: `${productName} in ${inventoryName} inventory is low (${quantity} items remaining)`,
      type: NotificationType.LOW_INVENTORY,
      relatedEntityId: productItemId,
      relatedEntityType: 'product_item',
    });
  }

  async findAll() {
    return this.notificationRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByUser(userId: number) {
    return this.notificationRepository.find({
      where: {
        userId,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByUser(userId: number) {
    return this.notificationRepository.find({
      where: {
        userId,
        isRead: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number) {
    const notification = await this.notificationRepository.findOneBy({ id });
    if (!notification) return null;

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return { success: true };
  }

  async remove(id: number) {
    const notification = await this.notificationRepository.findOneBy({ id });
    if (!notification) return null;

    await this.notificationRepository.remove(notification);
    return { id };
  }
}
