import { OrderItem } from 'src/order/entities/order_item.entity';
import { Return } from 'src/return/entities/return.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('return_items')
export class ReturnItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  numberOfItems: number;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.returnItems, {
    nullable: false,
    eager: true,
  })
  @JoinColumn()
  orderItem: OrderItem;

  @ManyToOne(() => Return, (returnParam) => returnParam.returnItems)
  return: Return;

  @DeleteDateColumn()
  deletedAt?: Date;
}
