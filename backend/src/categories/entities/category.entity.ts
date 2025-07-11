import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity'; // Assuming you have a Branch entity

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  // Arabic name
  @Column({
    type: 'varchar',
    nullable: true,
    default: 'اسم فئة المنتج',
  })
  nameAr: string;

  @Column({ nullable: true })
  description: string;

  // Arabic description
  @Column({ type: 'text', nullable: true })
  descriptionAr: string;

  @Column()
  branchId: number; // Directly store the branchId in Category

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' }) // Link to Branch entity using branchId
  branch: Branch; // Establish the foreign key relationship with Branch
}
