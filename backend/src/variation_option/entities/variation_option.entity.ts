import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { Variation } from 'src/variation/entities/variation.entity';
import { ProductItem } from 'src/product_item/entities/product_item.entity';

@Entity()
export class VariationOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string; // The value of the variation (e.g., "RED", "L")

  @ManyToOne(() => Variation, (variation) => variation.variationOptions)
  @JoinColumn() // Link to the Variation entity
  variation: Variation;

  @ManyToMany(() => ProductItem, (productItem) => productItem.variationOptions)
  productItems: ProductItem[]; // Establishing the reverse side of the relationship with ProductItem
}
