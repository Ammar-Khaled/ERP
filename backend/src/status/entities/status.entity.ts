import { Order } from 'src/order/entities/order.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import { Return } from 'src/return/entities/return.entity';
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

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  // Arabic name
  @Column({
    type: 'varchar',
    nullable: true,
    default: 'اسم الحالة',
  })
  nameAr: string;

  @Column({
    type: 'varchar',
    default: 'Status Description',
    nullable: true,
  })
  description: string;

  // Arabic description
  @Column({
    type: 'varchar',
    nullable: true,
    default: 'وصف الحالة',
  })
  descriptionAr: string;

  @OneToMany(() => PurchaseRequest, (purchaseRequest) => purchaseRequest.status)
  purchaseRequests: PurchaseRequest[];

  @OneToMany(() => Return, (returns) => returns.status)
  returns: Return[];

  @DeleteDateColumn() // Add DeleteDateColumn for soft delete
  deletedAt?: Date;

  @OneToMany(() => Order, (order) => order.status)
  orders: Order[];
}
