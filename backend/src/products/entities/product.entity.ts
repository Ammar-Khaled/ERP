// src/products/entities/product.entity.ts

import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Category } from '../../categories/entities/category.entity';
import { Unit } from '../../units/entities/unit.entity';
import { Currency } from '../../currency/entities/currency.entity';
import { ProductItem } from '../../product_item/entities/product_item.entity'; // Add this import
import { Return } from 'src/return/entities/return.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  quantity: number;

  @Column()
  mainPhoto: string;

  @Column()
  branch_id: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ nullable: true })
  brand: string;

  @Column()
  category_id: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  unit_id: number;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column()
  currency_id: number;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  // Add OneToMany relationship with ProductItem
  @OneToMany(() => ProductItem, (productItem) => productItem.product)
  productItems: ProductItem[];
}
