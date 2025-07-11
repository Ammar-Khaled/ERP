import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn()
  id: number; // Primary key

  @Column({ unique: true })
  name: string; // Name of the currency

  @Column({
    type: 'varchar',
    nullable: true,
    default: 'اسم العملة',
  })
  nameAr?: string;

  @Column()
  symbol: string; // Symbol of the currency

  @OneToMany(
    () => PurchaseRequest,
    (purchaseRequest) => purchaseRequest.currency,
  )
  purchaseRequests: PurchaseRequest[];
}
