import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../common/entities/address.entity';
import { Inventory } from '../../inventories/entities/inventory.entity';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string;

  @IsString()
  @IsOptional()
  @Column({ type: 'text', nullable: true })
  description: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phone: string;

  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToOne(() => Address, { eager: true, cascade: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => User, (user) => user.branch)
  users: User[];

  @OneToMany(() => Inventory, (inventory) => inventory.branch)
  inventories: Inventory[];
}
