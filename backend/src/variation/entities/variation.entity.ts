import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
@Entity()
export class Variation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
