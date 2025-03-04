import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductItem } from '../../product_item/entities/product_item.entity';
import { Inventory } from '../../inventories/entities/inventory.entity';

@Entity()
export class ProductItemToInventory {
  @PrimaryGeneratedColumn()
  id: number; // Primary key

  @Column('int')
  number_of_items: number; // Total number of items

  @Column('int')
  number_of_damaged: number = 0; // Total number of damaged items

  // Foreign key for ProductItem
  @Column()
  product_item_id: number;

  @ManyToOne(
    () => ProductItem,
    (productItem) => productItem.productItemToInventories,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'product_item_id' }) // Explicitly defining the foreign key column
  productItem: ProductItem;

  // Foreign key for Inventory
  @Column()
  inventory_id: number;

  @ManyToOne(
    () => Inventory,
    (inventory) => inventory.productItemToInventories,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'inventory_id' }) // Explicitly defining the foreign key column
  inventory: Inventory;
}
