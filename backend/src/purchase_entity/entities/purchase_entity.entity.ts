import { PurchaseItem } from 'src/purchase_item/entities/purchase_item.entity';
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

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  name: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    default: 'Example Description',
  })
  description: string;

  @Column({ type: 'decimal', nullable: false })
  unitPrice: number;

  @OneToMany(() => PurchaseItem, (item) => item.purchaseEntity)
  purchaseItems: PurchaseItem[];

  @DeleteDateColumn() // Add DeleteDateColumn for soft delete
  deletedAt?: Date;
}
