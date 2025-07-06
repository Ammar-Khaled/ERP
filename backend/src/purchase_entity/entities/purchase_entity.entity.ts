import { PurchaseItem } from 'src/purchase_request/entities/purchase_item.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
}
