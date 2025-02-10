import { Order } from 'src/order/entities/order.entity';
import { ProductItem } from 'src/product_item/entities/product_item.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
  } from 'typeorm';

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number_of_items: number;

    @Column()
    unit_price: number;

    @Column()
    total_price: number;

    //------------

    @Column()
    order_id: number; // Foreign key for Order

    @ManyToOne(() => Order)
    @JoinColumn({name: 'order_id'})
    order: Order;

    //------------

    @Column()
    product_item_id: number // Foreign key for Product_item

    @OneToOne(() => ProductItem)
    @JoinColumn({name: 'product_item_id'})
    productItem: ProductItem;
}
