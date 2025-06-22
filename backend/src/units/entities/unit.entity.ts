import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number; // Primary key for the unit

  @Column({ unique: true })
  name: string; // Name of the unit

  // Arabic name
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    default: 'اسم الوحدة',
  })
  nameAr: string;

  @Column({ nullable: true })
  description: string; // Description of the unit (optional)

  // Arabic description
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'وصف الوحدة',
  })
  descriptionAr: string;

  @Column({ default: true })
  isActive: boolean; // Indicates if the unit is active (default is true)
}
