import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from './address.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToOne(() => Address, (address) => address.branch)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => User, (user) => user.branch)
  users: User[];
}
