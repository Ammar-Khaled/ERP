import { PurchaseEntity } from 'src/purchase_entity/entities/purchase_entity.entity';
import {
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

  @Column({ type: 'varchar', length: 24, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  number_of_items: number;

  @Column({ type: 'decimal', nullable: false })
  unit_price: number;

  //# why not derive it from (numberOfItems * unitPrice)?
  @Column({ type: 'decimal', nullable: true })
  total_price: number;

  @ManyToOne(() => PurchaseEntity, (entity) => entity.purchaseItems, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'purchase_entity_id' })
  purchaseEntity: PurchaseEntity;

  //# todo: ManyToOne with purchase_request
}
