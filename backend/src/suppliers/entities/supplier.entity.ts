import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from '../../common/entities/address.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import { Branch } from '../../branches/entities/branch.entity';

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

  @Column({ type: 'varchar', nullable: true, unique: true })
  phone: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  addressId: number;

  @ManyToOne(() => Address, {
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

  @Column({ nullable: false })
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.suppliers)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;
}
