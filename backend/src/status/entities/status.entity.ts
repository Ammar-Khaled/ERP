import { Order } from 'src/order/entities/order.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import { Return } from 'src/return/entities/return.entity';
import { ReturnPurchase } from 'src/return_purchase/entities/return_purchase.entity';
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

  // Arabic name
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    default: 'اسم الحالة',
  })
  nameAr: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Status Description',
    nullable: true,
  })
  description: string;

  // Arabic description
  @Column({
    type: 'varchar',
    length: 100,
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

  // Relation with ReturnPurchase
  @OneToMany(() => ReturnPurchase, (returnPurchases) => returnPurchases.status)
  returnPurchases: ReturnPurchase[];
}