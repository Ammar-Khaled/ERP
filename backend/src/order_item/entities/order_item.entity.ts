import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { ProductItem } from 'src/product_item/entities/product_item.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  number_of_items: number;

  @Column({ type: 'float' })
  unit_price: number;

  @Column({ type: 'float', default: 0 })
  total_price: number;

  //---------------

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  //---------------

  @OneToOne(() => ProductItem, { nullable: false })
  @JoinColumn({ name: 'product_item_id' })
  productItem: ProductItem;
}
