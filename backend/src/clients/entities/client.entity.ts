import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from 'src/common/entities/address.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number: string;

  @OneToOne(() => Address, { cascade: false, eager: true }) // The 'address' relation
  @JoinColumn({ name: 'address_id' }) // This links the foreign key 'address_id' to the Address table
  address?: Address; // Make address optional as well, in case the address_id is not provided
}
