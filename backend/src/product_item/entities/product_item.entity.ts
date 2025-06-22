import {
  Column,
  DeleteDateColumn,
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
import { OrderItem } from 'src/order/entities/order_item.entity';

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

  @Column({ type: 'int', default: 0 })
  totalNumberOfValid: number; // Total quantity of this product item in stock

  @Column({ type: 'int', default: 0 })
  totalNumberOfDamaged: number; // Number of damaged items in stock

  @Column()
  name: string; // Name of the product item (e.g., variant name)

  // Arabic name
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: 'اسم المنتج',
  })
  nameAr?: string;

  @Column({ default: null })
  mainPhoto: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  productId: number; // Foreign key for category

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
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

  @OneToMany(() => OrderItem, (orderItem) => orderItem.productItem)
  orderItem: OrderItem;
}
