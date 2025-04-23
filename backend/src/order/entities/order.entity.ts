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

  @Column({type: 'float', default: 0.0, nullable: false})
  total_amount: number;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTheTotalAmount() {
    this.total_amount = this.items.reduce(
      (total, item) => total + item.total_price,
      0,
    );
  }

  @DeleteDateColumn()
  deletedAt: Date;

  //----------------

  @Column()
  branch_id: number; // Foreign key for branch

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  //----------------

  @Column()
  inventory_id: number; // Foreign key for inventory

  @ManyToOne(() => Inventory)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  //----------------

  @Column()
  user_id: number; // Foreign key for user

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  //----------------

  @Column()
  client_id: number; // Foreign key for client

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  //----------------

  @Column()
  status_id: number;

  @ManyToOne(() => Status, (status) => status.orders, {
    nullable: false,
  })
  @JoinColumn({ name: 'status_id' })
  status: Status;

  //----------------

  @Column()
  coupon_id: number; // Foreign key for coupon

  @ManyToOne(() => Coupon)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  //----------------

  @Column()
  currency_id: number; // Foreign key for currency

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  //-----------------

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @OneToMany(() => Return, (returnParam: Return) => returnParam.order)
  returns: Return[];
}
