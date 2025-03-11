import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductItemToInventory } from '../../product_item_inventory/entities/product_item_inventory.entity'; // Assuming a Product entity exists
import { Order } from 'src/order/entities/order.entity';

@Entity()
export class ProductItem {
  @PrimaryGeneratedColumn()
  id: number; // Primary key for the product item

  @Column()
  barcode: string; // Barcode for the product item

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number; // Cost price of the product item

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Selling price of the product item

  @Column('int')
  total_items: number; // Total quantity of this product item in stock

  @Column('int')
  number_of_damaged: number = 0; // Number of damaged items in stock

  @Column()
  name: string; // Name of the product item (e.g., variant name)

  @Column()
  product_id: number; // Foreign key for the parent product

  @ManyToOne(() => Product) // Relationship with Product entity
  @JoinColumn({ name: 'product_id' }) // Join column for the product foreign key
  product: Product; // The associated parent product

  @Column('simple-array', { nullable: true })
  photos?: string[]; // Array of photo URLs (optional)

  @OneToMany(
    () => ProductItemToInventory,
    (productItemToInventory) => productItemToInventory.productItem,
  )
  productItemToInventories: ProductItemToInventory[]; // One-to-many relationship with ProductItemInventory
}
