import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  start_date: string;

  @Column()
  end_date: string;

  @Column({ type: 'float' })
  discount_percentage: number;

  @Column()
  max_allowed: number;

  @Column()
  current_usage: number;

  @Column()
  number_of_usage_time_per_user: number;

  @Column()
  min_invoice_total: number;

  @Column()
  isActive: boolean;
}
