import { PurchaseItem } from "src/purchase_request/entities/purchase_item.entity";
import { BeforeInsert, BeforeUpdate, Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReturnPurchase } from "./return_purchase.entity";

@Entity('return_purchase_items')
export class ReturnPurchaseItem {
    // Properties and relationships: id, purchaseItemId, numberOfReturned, returnPurchaseId, deletedAt

    @PrimaryGeneratedColumn()
    id: number;

    // Holds the basic info, like name, description, price, etc.
    @Column({ type: 'int', nullable: false })
    purchaseItemId: number;
    @ManyToOne(() => PurchaseItem, (purchaseItem) => purchaseItem.returnPurchaseItems, {
        nullable: false, 
        eager: true,
    })
    purchaseItem: PurchaseItem;

    @Column({ type: 'int' , nullable: false })
    numberOfReturned: number;

    @Column({ type: 'float', nullable: false })
    returnedMoney: number;
    // Auto update the returned money value
    @BeforeInsert()
    @BeforeUpdate()
    calculateReturnedMoney() {
        this.returnedMoney = this.purchaseItem.purchaseEntity.unitPrice * this.numberOfReturned;
    }

    // Relation with the return purchase receipt
    @ManyToOne(() => ReturnPurchase, (returnPurchase) => returnPurchase.returnPurchaseItems)
    returnPurchase: ReturnPurchase;

    @DeleteDateColumn()
    deletedAt?: Date;
}