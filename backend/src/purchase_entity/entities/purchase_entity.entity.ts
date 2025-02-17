import { PurchaseItem } from 'src/purchase_item/entities/purchase_item.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('purchase_entities')
export class PurchaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  //# tofix: unique: true
  @Column({ type: 'varchar', length: 20, nullable: false, unique: false })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  @OneToMany(() => PurchaseItem, (item) => item.purchaseEntity)
  purchaseItems: PurchaseItem[];
}
