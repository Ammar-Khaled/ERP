import { Order } from 'src/order/entities/order.entity';
import { ReturnItem } from 'src/return/entities/return_item.entity';
import { Status } from 'src/status/entities/status.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar', length: 255, default: 'Not Specified' })
  reason: string;

  // Arabic reason
  @Column({ type: 'varchar', length: 255, nullable: true, default: 'غير محدد' })
  reasonAr: string;

  @OneToMany(() => ReturnItem, (returnItem) => returnItem.return, {
    nullable: false,
    eager: true,
  })
  returnItems: ReturnItem[];

  @Column({ type: 'int', nullable: false })
  orderId: number;

  @ManyToOne(() => Order, (order: Order) => order.returns, {
    nullable: false,
  })
  order: Order;

  @Column({ type: 'int', nullable: false })
  statusId: number;

  @ManyToOne(() => Status, (status) => status.returns, {
    nullable: false,
  })
  status: Status;

  @DeleteDateColumn()
  deletedAt?: Date;
}
