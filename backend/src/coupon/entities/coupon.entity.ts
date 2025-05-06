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

  @Column({ nullable: true }) //# ToFix: should not be nullable
  code: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column({ type: 'float' })
  discountPercentage: number;

  @Column()
  maxAllowed: number;

  @Column()
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
