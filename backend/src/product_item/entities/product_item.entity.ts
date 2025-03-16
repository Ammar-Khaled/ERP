import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductItemToInventory } from '../../product_item_inventory/entities/product_item_inventory.entity';
import { VariationOption } from 'src/variation_option/entities/variation_option.entity'; // Assuming a VariationOption entity exists
@Entity()
export class ProductItem {
  @PrimaryGeneratedColumn()
  id: number; // Primary key for the product item

  @Column({ unique: true })
  barcode: string; // Barcode for the product item, now enforced as unique

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number; // Cost price of the product item

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Selling price of the product item

  @Column('int')
  number_of_valid: number; // Total quantity of this product item in stock

  @Column('int')
  number_of_damaged: number = 0; // Number of damaged items in stock

  @Column()
  name: string; // Name of the product item (e.g., variant name)

  @Column()
  product_id: number; // Foreign key for category

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column('simple-array', { nullable: true })
  photos?: string[]; // Array of photo URLs (optional)

  @OneToMany(
    () => ProductItemToInventory,
    (productItemToInventory) => productItemToInventory.productItem,
  )
  productItemToInventories: ProductItemToInventory[]; // One-to-many relationship with ProductItemInventory

  // Many-to-many relationship with VariationOption entity
  @ManyToMany(
    () => VariationOption,
    (variationOption) => variationOption.productItems,
  )
  @JoinTable() // Creates a join table to manage the relationship
  variationOptions: VariationOption[]; // The associated variation options
}
