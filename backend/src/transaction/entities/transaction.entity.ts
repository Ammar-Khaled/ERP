import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Treasury } from 'src/treasury/entities/treasury.entity';
import { User } from 'src/users/entities/user.entity';
import { Account } from 'src/accounts/entities/account.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp' })
  transaction_date: Date;

  @Column()
  payment_method: string;

  @Column()
  treasury_id: number;

  @ManyToOne(() => Treasury)
  @JoinColumn({ name: 'treasury_id' })
  treasury: Treasury;

  @Column()
  added_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by' })
  addedBy: User;

  @Column()
  account_id: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ nullable: true })
  purchase_id: number;

  @Column({ nullable: true })
  order_id: number;

  @DeleteDateColumn()
  deletedAt: Date;
}
