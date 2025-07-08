import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from '../../common/entities/address.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { ProductItemToInventory } from '../../product_item_inventory/entities/product_item_inventory.entity';
import { PurchaseRequest } from '../../purchase_request/entities/purchase_request.entity';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  // Arabic name
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'اسم المخزن',
  })
  nameAr: string;

  @Column({ type: 'bool', default: true })
  isActive: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'int', default: 0 })
  totalNumberOfValid: number;

  @Column({ type: 'int', default: 0 })
  totalNumberOfDamaged: number;

  @Column({ nullable: true })
  addressId: number;

  @OneToOne(() => Address, {
    eager: false,
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @Column()
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.inventories)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @OneToMany(
    () => ProductItemToInventory,
    (productItemToInventory) => productItemToInventory.inventory,
  )
  productItemToInventories: ProductItemToInventory[];

  @OneToMany(
    () => PurchaseRequest,
    (purchaseRequest) => purchaseRequest.inventory,
  )
  purchaseRequests: PurchaseRequest[];

  @Column({ type: 'int', default: 0 })
  totalNumberOfPurchaseEntities: number;
}
