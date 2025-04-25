import { Branch } from 'src/branches/entities/branch.entity';
import { Status } from 'src/status/entities/status.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { Supplier } from 'src/suppliers/entities/supplier.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PurchaseItem } from 'src/purchase_item/entities/purchase_item.entity';

@Entity('purchase_requests')
export class PurchaseRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ type: 'decimal', nullable: false })
  totalPrice: number;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalPrice() {
    this.totalPrice = this.purchaseItems.reduce(
      (total, item) => total + item.total_price,
      0,
    );
  }

  @ManyToOne(() => User, (user) => user.purchaseRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Branch, (branch) => branch.purchaseRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => Status, (status) => status.purchaseRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @ManyToOne(() => Currency, (currency) => currency.purchaseRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @OneToMany(() => PurchaseItem, (item) => item.purchaseRequest, {
    nullable: false,
  })
  purchaseItems: PurchaseItem[];

  @DeleteDateColumn() // Add DeleteDateColumn for soft delete
  deletedAt?: Date;
}
