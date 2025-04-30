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
import { Branch } from '../../branches/entities/branch.entity';
import { User } from 'src/users/entities/user.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Coupon } from 'src/coupon/entities/coupon.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { Status } from 'src/status/entities/status.entity';
import { Inventory } from 'src/inventories/entities/inventory.entity';
import { Return } from 'src/return/entities/return.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ type: 'float', default: 0.0, nullable: false })
  totalAmount: number;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTheTotalAmount() {
    this.totalAmount = this.items.reduce(
      (total, item) => total + item.totalPrice,
      0,
    );
  }

  @DeleteDateColumn()
  deletedAt: Date;

  //----------------

  @Column()
  branchId: number; // Foreign key for branch

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  //----------------

  @Column()
  inventoryId: number; // Foreign key for inventory

  @ManyToOne(() => Inventory)
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  //----------------

  @Column()
  userId: number; // Foreign key for user

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  //----------------

  @Column()
  clientId: number; // Foreign key for client

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  //----------------

  @Column()
  statusId: number;

  @ManyToOne(() => Status, (status) => status.orders, {
    nullable: false,
  })
  @JoinColumn({ name: 'statusId' })
  status: Status;

  //----------------

  @Column()
  couponId: number; // Foreign key for coupon

  @ManyToOne(() => Coupon)
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;

  //----------------

  @Column()
  currencyId: number; // Foreign key for currency

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  //-----------------

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @OneToMany(() => Return, (returnParam: Return) => returnParam.order)
  returns: Return[];
}
