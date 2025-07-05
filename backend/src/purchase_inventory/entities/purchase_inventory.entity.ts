import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Inventory } from 'src/inventories/entities/inventory.entity';
import { PurchaseEntity } from '../../purchase_entity/entities/purchase_entity.entity';

@Entity('purchase_entity_inventory')
export class PurchaseInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchaseEntityId: number;

  @Column()
  inventoryId: number;

  @ManyToOne(() => PurchaseEntity)
  @JoinColumn({ name: 'purchaseEntityId' })
  purchaseEntity: PurchaseEntity;

  @ManyToOne(() => Inventory)
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;

  @Column()
  amount: number;
}
