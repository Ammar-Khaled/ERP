import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Address } from 'src/common/entities/address.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone_number: string;

  @Column({ unique: true }) // Ensure address_id is unique
  address_id: number;

  @OneToOne(() => Address, { cascade: false, eager: true })
  @JoinColumn({ name: 'address_id' })
  address: Address;
}