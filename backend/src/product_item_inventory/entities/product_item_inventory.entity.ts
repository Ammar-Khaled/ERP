import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductItem } from '../../product_item/entities/product_item.entity'; // Adjust path as needed
import { Inventory } from '../../inventories/entities/inventory.entity'; // Adjust path as needed

@Entity()
export class ProductItemInventory {
  @PrimaryGeneratedColumn()
  id: number; // Primary key

  @Column()
  number_of_items: number; // Total number of items

  @Column()
  number_of_damaged: number; // Total number of damaged items

  @Column()
  product_item_id: number; // Foreign key for ProductItem

  @ManyToOne(() => ProductItem) // Define relationship with ProductItem
  @JoinColumn({ name: 'product_item_id' }) // Join column for the product_item_id foreign key
  productItem: ProductItem;

  @Column()
  inventory_id: number; // Foreign key for Inventory

  @ManyToOne(() => Inventory) // Define relationship with Inventory
  @JoinColumn({ name: 'inventory_id' }) // Join column for the inventory_id foreign key
  inventory: Inventory;
}
