import { PurchaseEntity } from 'src/purchase_entity/entities/purchase_entity.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchaseEntityId: number;

  @ManyToOne(() => PurchaseEntity, (entity) => entity.purchaseItems, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'purchaseEntityId' })
  purchaseEntity: PurchaseEntity;

  @Column({ type: 'int', nullable: false })
  numberOfItems: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  discount: number;

  @Column({ type: 'decimal', nullable: false })
  totalPrice: number;

  @ManyToOne(() => PurchaseRequest, (request) => request.purchaseItems)
  purchaseRequest: PurchaseRequest;

  // Note: only called when detecting ACTUAL update!
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalPrice() {
    this.totalPrice =
      this.numberOfItems * this.purchaseEntity.unitPrice - this.discount;
  }

  @DeleteDateColumn() // Add DeleteDateColumn for soft delete
  deletedAt?: Date;
}
