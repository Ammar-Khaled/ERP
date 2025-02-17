import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Variation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
