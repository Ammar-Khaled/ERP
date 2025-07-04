import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inventory } from 'src/inventories/entities/inventory.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';

@Entity('purchase_inventory')
export class PurchaseInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchaseRequestId: number;

  @Column()
  inventoryId: number;

  @ManyToOne(() => PurchaseRequest)
  @JoinColumn({ name: 'purchaseRequestId' })
  purchaseRequest: PurchaseRequest;

  @ManyToOne(() => Inventory)
  @JoinColumn({ name: 'inventoryId' })
  inventory: Inventory;
}
