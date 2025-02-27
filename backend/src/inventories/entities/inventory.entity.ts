import {
  Column,
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

  total_product_items: number;

  total_damaged_items: number;

  @OneToOne(() => Address, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  address: Address;

  @ManyToOne(() => Branch, (branch) => branch.inventories)
  @JoinColumn()
  branch: Branch;

  @OneToMany(
    () => ProductItemToInventory,
    (productItemToInventory) => productItemToInventory.inventory,
  )
  productItemToInventories: ProductItemToInventory[];
}
