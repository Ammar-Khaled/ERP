import { Order } from "src/order/entities/order.entity";
import { ReturnItem } from "src/return_item/entities/return_item.entity";
import { Status } from "src/status/entities/status.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('returns')
export class Return {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'varchar', length: 255, default: "Not Specified" })
    reason: string;

    @OneToMany(() => ReturnItem, (returnItem) => returnItem.return, {
        nullable: false,
        eager: true,
    })
    returnItems: ReturnItem[];

    @ManyToOne(() => Order, (order: Order) => order.returns, {
        nullable: false,
    })
    order: Order;

    @ManyToOne(() => Status, (status) => status.returns, {
        nullable: false,
        eager: true,
    })
    status: Status;

    @DeleteDateColumn()
    deletedAt?: Date;
}
