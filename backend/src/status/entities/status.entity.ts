import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Status Description',
    nullable: true,
  })
  description: string;
}
