import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Address } from '../../common/entities/address.entity';
import { Role } from '../../roles/role.entity';
import { Branch } from '../../common/entities/branch.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @ManyToOne(() => Address, (address) => address.users, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @ManyToOne(() => Role, (role) => role.users, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Branch, (branch) => branch.users, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // TODO: add disabling time
}
