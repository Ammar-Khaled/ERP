import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductItemToInventory } from '../../product_item_inventory/entities/product_item_inventory.entity';
import { VariationOption } from 'src/variation_option/entities/variation_option.entity'; // Assuming a VariationOption entity exists
import { Category } from 'src/categories/entities/category.entity';
import { Unit } from 'src/units/entities/unit.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { Branch } from 'src/branches/entities/branch.entity';
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
  total_items: number; // Total quantity of this product item in stock

  @Column('int')
  number_of_damaged: number = 0; // Number of damaged items in stock

  @Column()
  name: string; // Name of the product item (e.g., variant name)

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

  @Column()
  category_id: number; // Foreign key for category

  @ManyToOne(() => Category) // Relationship with Category entity
  @JoinColumn({ name: 'category_id' }) // Join column for the category foreign key
  category: Category; // The associated category

  @Column({ default: true })
  isActive: boolean; // Whether the product is active

  @Column()
  unit_id: number; // Foreign key for unit

  @ManyToOne(() => Unit) // Relationship with Unit entity
  @JoinColumn({ name: 'unit_id' }) // Join column for the unit foreign key
  unit: Unit; // The associated unit

  @Column()
  currency_id: number; // Foreign key for currency

  @ManyToOne(() => Currency) // Relationship with Currency entity
  @JoinColumn({ name: 'currency_id' }) // Join column for the currency foreign key
  currency: Currency;

  @Column()
  mainPhoto: string; // URL or path to the main photo

  @Column()
  branch_id: number; // Foreign key for branch

  @ManyToOne(() => Branch) // Relationship with Branch entity
  @JoinColumn({ name: 'branch_id' }) // Join column for the branch foreign key
  branch: Branch; // The associated branch
}
