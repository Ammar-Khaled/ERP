import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  street: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @OneToMany(() => Supplier, (supplier) => supplier.address)
  suppliers: Supplier[];

  @OneToMany(() => User, (user) => user.address)
  users: User[];

  @OneToOne(() => Branch, (branch) => branch.address)
  branch: Branch;
  //# todo: add longitude & latitude
}
