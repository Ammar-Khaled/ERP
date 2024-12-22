import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../common/entities/address.entity';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 255, nullable: false })
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

  @OneToOne(() => Address, (address) => address.branch)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => User, (user) => user.branch)
  users: User[];
}
