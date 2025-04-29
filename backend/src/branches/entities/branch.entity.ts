import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../common/entities/address.entity';
import { Inventory } from '../../inventories/entities/inventory.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  addressId: number;

  @OneToOne(() => Address, { cascade: true })
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @OneToMany(() => User, (user) => user.branch)
  users: User[];

  @OneToMany(() => Inventory, (inventory) => inventory.branch)
  inventories: Inventory[];

  @OneToMany(
    () => PurchaseRequest,
    (purchaseRequests) => purchaseRequests.branch,
  )
  purchaseRequests: PurchaseRequest[];
}
