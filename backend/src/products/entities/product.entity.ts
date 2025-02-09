import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Category } from '../../categories/entities/category.entity';
import { Unit } from '../../units/entities/unit.entity';
import { Currency } from '../../currency/entities/currency.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number; // Primary key

  @Column()
  name: string; // Product name

  @Column()
  type: string; // Product type

  @Column()
  quantity: number; // Product quantity

  @Column()
  mainPhoto: string; // URL or path to the main photo

  @Column()
  branch_id: number; // Foreign key for branch

  @ManyToOne(() => Branch) // Relationship with Branch entity
  @JoinColumn({ name: 'branch_id' }) // Join column for the branch foreign key
  branch: Branch; // The associated branch

  @Column({ nullable: true }) // Optional field
  brand: string; // Product brand

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
  currency: Currency; // The associated currency
}
