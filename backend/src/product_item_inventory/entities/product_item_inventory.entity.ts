import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductItem } from '../../product_item/entities/product_item.entity'; // Adjust path as needed
import { Inventory } from '../../inventories/entities/inventory.entity'; // Adjust path as needed

@Entity()
export class ProductItemToInventory {
  @PrimaryGeneratedColumn()
  id: number; // Primary key

  @Column()
  number_of_items: number; // Total number of items

  @Column()
  number_of_damaged: number; // Total number of damaged items

  @Column()
  product_item_id: number; // Foreign key for ProductItem

  @Column()
  inventory_id: number; // Foreign key for Inventory

  @ManyToOne(
    () => ProductItem,
    (productItem) => productItem.productItemToInventories,
  )
  productItem: ProductItem;

  @ManyToOne(() => Inventory, (inventory) => inventory.productItemToInventories)
  inventory: Inventory;
}
