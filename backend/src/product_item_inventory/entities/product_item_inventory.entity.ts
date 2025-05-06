import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductItem } from '../../product_item/entities/product_item.entity';
import { Inventory } from '../../inventories/entities/inventory.entity';

@Entity()
export class ProductItemToInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  numberOfValid: number;

  @Column({ type: 'int', default: 0 })
  numberOfDamaged: number;

  @PrimaryColumn()
  productItemId: number;

  @ManyToOne(
    () => ProductItem,
    (productItem) => productItem.productItemToInventories,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'productItemId' })
  productItem: ProductItem;

  @PrimaryColumn()
  inventoryId: number;

  @ManyToOne(
    () => Inventory,
    (inventory) => inventory.productItemToInventories,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'inventoryId' }) // Explicitly defining the foreign key column
  inventory: Inventory;
}
