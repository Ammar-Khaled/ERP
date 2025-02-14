import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Variation } from 'src/variation/entities/variation.entity';
@Entity()
export class VariationOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column()
  variation_id: number; // Directly store the branch_id in Category

  @ManyToOne(() => Variation)
  @JoinColumn({ name: 'variation_id' })
  variation: Variation;
}
