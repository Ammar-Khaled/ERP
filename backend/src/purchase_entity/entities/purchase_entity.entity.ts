import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('purchase_entities')
export class PurchaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 200, nullable: true })
    description: string;
}
