import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from 'src/common/entities/address.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  // Arabic name
  @Column({
    type: 'varchar',
    nullable: true,
    default: 'اسم العميل',
  })
  nameAr: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  phone_number: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  addressId: number;

  @ManyToOne(() => Address, { cascade: true, eager: false, nullable: true })
  @JoinColumn()
  address: Address;
}
