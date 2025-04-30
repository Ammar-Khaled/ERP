import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VariationOption } from 'src/variation_option/entities/variation_option.entity';

@Entity()
export class Variation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    () => VariationOption,
    (variationOption) => variationOption.variation,
  )
  variationOptions: VariationOption[];
}
