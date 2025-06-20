import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Category } from '../../categories/entities/category.entity';
import { Unit } from '../../units/entities/unit.entity';
import { Currency } from '../../currency/entities/currency.entity';
import { ProductItem } from '../../product_item/entities/product_item.entity'; // Add this import

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Arabic name
  @Column({ type: 'varchar', length: 50, nullable: true, default: "اسم المنتج" })
  nameAr?: string;

  @Column()
  branchId: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ nullable: true })
  brand: string;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  unitId: number;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  currencyId: number;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  productItemIds: number[];

  // Add OneToMany relationship with ProductItem
  @OneToMany(() => ProductItem, (productItem) => productItem.product)
  productItems: ProductItem[];
}
