import { PurchaseEntity } from 'src/purchase_entity/entities/purchase_entity.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('purchase_items')
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PurchaseEntity, (entity) => entity.purchaseItems, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'purchase_entity_id' })
  purchaseEntity: PurchaseEntity;

  @Column({ type: 'int', nullable: false })
  number_of_items: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  discount: number;

  @Column({ type: 'decimal', nullable: false })
  total_price: number;

  @ManyToOne(() => PurchaseRequest, (request) => request.purchaseItems)
  purchaseRequest: PurchaseRequest;

  // Note: only called when detecting ACTUAL update!
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalPrice() {
    this.total_price =
      this.number_of_items * this.purchaseEntity.unit_price - this.discount;
  }
}
