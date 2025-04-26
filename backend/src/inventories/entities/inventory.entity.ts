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

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'bool', default: true })
  isActive: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  total_product_items: number = 0;

  total_damaged_items: number = 0;

  @Column()
  addressId: number;

  @OneToOne(() => Address, {
    eager: false,
    cascade: true,
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
}
