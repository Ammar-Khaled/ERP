import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('return_items')
export class ReturnItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  number_of_items: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  //# TODO: Add relation with return entity

  //# TODO: add relation with order item
}
