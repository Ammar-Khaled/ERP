import { Order } from "src/order/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { ReturnItem } from "src/return_item/entities/return_item.entity";
import { Status } from "src/status/entities/status.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('returns')
export class Return {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'varchar', length: 255 })
    reason: string;

    @OneToOne(() => Order, (order: Order) => order.return, {
        nullable: false,
    })
    order: Order;

    //# Ensure the relation
    @ManyToMany(() => Product, (products) => products.returns)
    products: Product[];

    @OneToMany(() => ReturnItem, (returnItem) => returnItem.return, {
        nullable: false,
    })
    returnItems: ReturnItem[];

    @ManyToOne(() => Status, (status) => status.returns, {
        nullable: false,
    })
    status: Status;
}
