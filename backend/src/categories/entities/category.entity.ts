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

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  branch_id: number; // Directly store the branch_id in Category

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' }) // Link to Branch entity using branch_id
  branch: Branch; // Establish the foreign key relationship with Branch
}
