import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('statuses')
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'Status Description',
    nullable: true,
  })
  description: string;

  @OneToMany(() => PurchaseRequest, (purchaseRequest) => purchaseRequest.status)
  purchaseRequests: PurchaseRequest[];
}
