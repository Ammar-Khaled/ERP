import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { VariationOption } from 'src/variation_option/entities/variation_option.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Variation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => VariationOption, (variationOption) => variationOption.variation)
  variationOptions: VariationOption[];
}
