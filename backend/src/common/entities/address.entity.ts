import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  street: string;

  // Arabic street
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'اسم الشارع',
  })
  streetAr: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  // Arabic city
  @Column({ type: 'varchar', length: 100, nullable: true, default: 'المدينة' })
  cityAr: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  // Arabic state
  @Column({ type: 'varchar', length: 100, nullable: true, default: 'المنطقة' })
  stateAr: string;

  @Column({ type: 'varchar', nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  // Arabic country
  @Column({ type: 'varchar', length: 100, nullable: true, default: 'الدولة' })
  countryAr: string;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @DeleteDateColumn()
  deletedAt: Date;
}
