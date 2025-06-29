import { PurchaseEntity } from 'src/purchase_entity/entities/purchase_entity.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import { ReturnPurchaseItem } from 'src/return_purchase/entities/return_purchase_item.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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

  // TODO: make nullable false -> pass the purchase request id when creating the purchase item
  @Column({ type: 'int', nullable: true })
  purchaseRequestId: number;

  @ManyToOne(() => PurchaseRequest, (request) => request.purchaseItems, {
    nullable: true,
  })
  purchaseRequest: PurchaseRequest;

  // Note: only called when detecting ACTUAL update!
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalPrice() {
    this.totalPrice =
      this.numberOfItems * this.purchaseEntity.unitPrice - this.discount;
  }

  // Relation with the return purchase items
  @OneToMany(
    () => ReturnPurchaseItem,
    (returnPurchaseItems) => returnPurchaseItems.purchaseItem,
  )
  returnPurchaseItems: ReturnPurchaseItem[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
