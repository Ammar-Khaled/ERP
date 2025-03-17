import { Order } from 'src/order/entities/order.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Status Description',
    nullable: true,
  })
  description: string;

  @OneToMany(() => PurchaseRequest, (purchaseRequest) => purchaseRequest.status)
  purchaseRequests: PurchaseRequest[];

  @DeleteDateColumn() // Add DeleteDateColumn for soft delete
  deletedAt?: Date;

  @OneToMany(() => Order, (order) => order.status)
  orders: Order[];
}
