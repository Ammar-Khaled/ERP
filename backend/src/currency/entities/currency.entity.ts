import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn()
  id: number; // Primary key

  @Column()
  name: string; // Name of the currency

  @Column()
  symbol: string; // Symbol of the currency
}