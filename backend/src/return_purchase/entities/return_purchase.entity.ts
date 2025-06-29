import { BeforeInsert, BeforeUpdate, Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ReturnPurchaseItem } from "./return_purchase_item.entity";
import { PurchaseRequest } from "src/purchase_request/entities/purchase_request.entity";
import { Status } from "src/status/entities/status.entity";

@Entity('return_purchases')
export class ReturnPurchase {
    // Properties and relationships: id, date, reason, returnPurchaseItems, purchaseRequestId, status, deletedAt

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    // Both arabic and english reasons
    @Column({ type: 'varchar', length: 255, default: 'Not Specified' })
    reason: string;
    @Column({ type: 'varchar', length: 255, nullable: true, default: 'غير محدد' })
    reasonAr: string;

    // Relation with the purchase request
    @Column({ type: 'int', nullable: false })
    purchaseRequestId: number;
    @ManyToOne(() => PurchaseRequest, (purchaseRequest) => purchaseRequest.returnPurchases, {
        nullable: false,
    })
    purchaseRequest: PurchaseRequest;

    @OneToMany(() => ReturnPurchaseItem, (returnPurchaseItems) => returnPurchaseItems.returnPurchase, {
        nullable: false,
        eager: true,
    })
    returnPurchaseItems: ReturnPurchaseItem[];

    @Column({ type: 'float' })
    totalReturnedMoney: number;
    // Auto calculate before insertion or update
    @BeforeInsert()
    @BeforeUpdate()
    calculateTotalReturnedMoney() {
        this.totalReturnedMoney = this.returnPurchaseItems.reduce(
            (total: number, item: ReturnPurchaseItem) => total + item.returnedMoney, 0
        );
    }

    // Relation with the status
    @Column({ type: 'int', nullable: false })
    statusId: number;
    @ManyToOne(() => Status, (status) => status.returnPurchases)
    status: Status;

    @DeleteDateColumn()
    deletedAt?: Date;

}

