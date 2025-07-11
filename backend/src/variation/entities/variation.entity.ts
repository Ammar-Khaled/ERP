import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VariationOption } from 'src/variation_option/entities/variation_option.entity';

@Entity()
export class Variation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: 'اسم المتغير',
  })
  nameAr: string;

  @OneToMany(
    () => VariationOption,
    (variationOption) => variationOption.variation,
  )
  variationOptions: VariationOption[];
}
