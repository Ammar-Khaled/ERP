import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  statusId: number;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: false })
  statusName: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Status Description',
    nullable: true,
  })
  statusDescription: string;
}
