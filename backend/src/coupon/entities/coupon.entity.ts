import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: false })
  code: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: false })
  endDate: Date;

  @Column({ type: 'float' })
  discountPercentage: number;

  @Column()
  maxAllowed: number;

  @Column({ default: 0 })
  currentUsage: number;

  @Column()
  numberOfUsageTimePerUser: number;

  @Column()
  minInvoiceTotal: number;

  @Column()
  isActive: boolean;

  @DeleteDateColumn()
  deletedAt: Date;
}
