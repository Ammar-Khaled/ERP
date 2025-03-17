import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { Return } from 'src/return/entities/return.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('return_items')
export class ReturnItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  numberOfItems: number;

  // add one-to-one relation with order item module
  @OneToOne(() => OrderItem, (orderItem) => orderItem.returnItem, {
    nullable: false
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;
  
  @ManyToOne(() => Return, (returnParam) => returnParam.returnItems)
  return: Return;

  @DeleteDateColumn()
  deletedAt?: Date;
}
