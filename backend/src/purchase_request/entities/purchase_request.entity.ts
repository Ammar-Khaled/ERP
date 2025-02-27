import { Branch } from 'src/branches/entities/branch.entity';
import { Status } from 'src/status/entities/status.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('purchase_requests')
export class PurchaseRequest {
  /// Basic properties ///

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  /// Foreign keys ///

  //# Fix nullable values, it should be false

  @ManyToOne(() => User, (user) => user.purchaseRequests, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Branch, (branch) => branch.purchaseRequests, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseRequests, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToOne(() => Status, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @OneToOne(() => Currency, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;
}
