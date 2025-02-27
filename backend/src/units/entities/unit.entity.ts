import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number; // Primary key for the unit

  @Column()
  name: string; // Name of the unit

  @Column({ nullable: true })
  description: string; // Description of the unit (optional)

  @Column({ default: true })
  isActive: boolean; // Indicates if the unit is active (default is true)
}
