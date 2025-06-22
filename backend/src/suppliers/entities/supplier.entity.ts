import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
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

  // Arabic name
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'اسم المورد',
  })
  nameAr: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phone: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  addressId: number;

  @OneToOne(() => Address, {
    cascade: true,
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @OneToMany(
    () => PurchaseRequest,
    (purchaseRequest) => purchaseRequest.supplier,
  )
  purchaseRequests: PurchaseRequest[];
}
