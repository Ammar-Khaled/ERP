import { PurchaseItem } from 'src/purchase_request/entities/purchase_item.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('purchase_entities')
export class PurchaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  name: string;

  // Arabic name
  @Column({
    type: 'varchar',
    nullable: true,
    default: 'اسم العنصر',
  })
  nameAr: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    default: 'Example Description',
  })
  description: string;

  // Arabic description
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    default: 'وصف العنصر',
  })
  descriptionAr: string;

  @Column({ type: 'decimal', nullable: false })
  unitPrice: number;

  @OneToMany(() => PurchaseItem, (item) => item.purchaseEntity)
  purchaseItems: PurchaseItem[];

  @DeleteDateColumn() // Add DeleteDateColumn for soft delete
  deletedAt?: Date;

  @Column({ type: 'int', default: 0 })
  totalAmount: number = 0;

  @Column()
  branchId: number;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;
}
