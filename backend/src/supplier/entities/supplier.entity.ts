import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from '../../common/entities/address.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @ManyToOne(() => Address, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => PurchaseRequest, (purchaseRequests) => purchaseRequests.supplier)
  purchaseRequests: PurchaseRequest[];
}
