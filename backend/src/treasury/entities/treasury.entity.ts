import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('treasury')
export class Treasury {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column('decimal', { precision: 12, scale: 2 })
  starting_balance: number;

  @Column('decimal', { precision: 12, scale: 2 })
  current_balance: number;

  @Column()
  treasury_type: string;

  @Column()
  added_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by' })
  addedBy: User;

  @DeleteDateColumn()
  deletedAt: Date;
}
