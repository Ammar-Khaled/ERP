import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from 'src/users/entities/user.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Coupon } from 'src/coupon/entities/coupon.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { Return } from 'src/return/entities/return.entity';

export enum STATUS {
  COMPLETED = 0,
  PENDING = 1,
  CANCELED = 2,
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column({ type: 'float' })
  total_amount: number;

  @Column({ default: false })
  is_returned: boolean;

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

  @Column({
    type: 'enum',
    enum: STATUS,
    default: STATUS.PENDING,
  })
  status: STATUS;

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

  @OneToOne(() => Return, (returnParam: Return) => returnParam.order)
  return: Return;
}
