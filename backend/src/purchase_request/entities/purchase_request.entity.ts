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
import { PurchaseItem } from 'src/purchase_request/entities/purchase_item.entity';

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
      (total, item) => total + item.totalPrice,
      0,
    );
  }

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', nullable: false })
  branchId: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ type: 'int', nullable: false })
  supplierId: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'int', nullable: false })
  statusId: number;

  @ManyToOne(() => Status)
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @Column({ type: 'int', nullable: false })
  currencyId: number;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  @OneToMany(() => PurchaseItem, (item) => item.purchaseRequest, {
    nullable: false,
  })
  purchaseItems: PurchaseItem[];

  @DeleteDateColumn() // Add DeleteDateColumn for soft delete
  deletedAt?: Date;

  @Column({ type: 'int', nullable: false })
  reviewerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ nullable: true })
  reviewNotes: string;
}
