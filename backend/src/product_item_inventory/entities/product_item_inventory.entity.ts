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
  numberOfValid: number;

  @Column('int')
  numberOfDamaged: number = 0;

  // Foreign key for ProductItem
  @Column()
  productItemId: number;

  @ManyToOne(
    () => ProductItem,
    (productItem) => productItem.productItemToInventories,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'productItemId' }) // Explicitly defining the foreign key column
  productItem: ProductItem;

  // Foreign key for Inventory
  @Column()
  inventoryId: number;

  @ManyToOne(
    () => Inventory,
    (inventory) => inventory.productItemToInventories,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'inventoryId' }) // Explicitly defining the foreign key column
  inventory: Inventory;
}
