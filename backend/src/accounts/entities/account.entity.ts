import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { AccountType } from 'src/account_types/entities/account_type.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  account_number: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column('decimal', { precision: 12, scale: 2 })
  start_balance: number;

  @Column('decimal', { precision: 12, scale: 2 })
  current_balance: number;

  @Column({ default: false })
  is_archieved: boolean;

  @Column()
  account_type_id: number;

  @ManyToOne(() => AccountType)
  @JoinColumn({ name: 'account_type_id' })
  accountType: AccountType;

  @Column()
  added_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by' })
  addedBy: User;

  @DeleteDateColumn()
  deletedAt: Date;
}
