import { Branch } from 'src/branches/entities/branch.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Coupon } from 'src/coupon/entities/coupon.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';


  export enum STATUS {
    COMPLETED = 0,
    PENDING = 1,
    CANCELED = 2
  }

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: string;

    @Column()
    total_amount: number;

    @Column()
    is_returned: boolean;

    //-----------------

    @Column()
    branch_id: number; // Foreign key for Branch

    @ManyToOne(() => Branch)
    @JoinColumn({name: 'branch_id'})
    branch: Branch;

    //-----------------
    @Column()
    user_id: number; // Foreign key for User

    @ManyToOne(() => User)
    @JoinColumn({name: 'user_id'})
    user: User;

    //-----------------

    @Column()
    client_id: number; // Foreign key for Client

    @ManyToOne(() => Client)
    @JoinColumn({name: 'client_id'})
    client: Client;
    //-----------------

    @Column({
        type: 'enum',
        enum: STATUS,
        default: STATUS.PENDING
    })
    status: STATUS;

    //-----------------

    @Column()
    coupon_id: number;

    @ManyToOne(() => Coupon)
    @JoinColumn({name: 'coupon_id'})
    coupon: Coupon;

    //-----------------

    @Column()
    currency_id: number; // Foreign key for currency

    @ManyToOne(() => Currency)
    @JoinColumn({ name: 'currency_id' })
    currency: Currency;
}
