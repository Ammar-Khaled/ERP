import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum NotificationType {
  LOW_INVENTORY = 'low_inventory',
  PURCHASE_REQUEST_CREATED = 'purchase_request_created',
  PURCHASE_REQUEST_APPROVED = 'purchase_request_approved',
  PURCHASE_REQUEST_REJECTED = 'purchase_request_rejected',
  GENERAL = 'general',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  type: NotificationType;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  relatedEntityId: number;

  @Column({ nullable: true })
  relatedEntityType: string;
}
