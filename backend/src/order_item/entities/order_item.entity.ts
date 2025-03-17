import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @Column({ type: 'float', default: 0.0 })
  total_price: number;

  @DeleteDateColumn()
  deletedAt: Date;

  //---------------

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  //---------------

  @Column()
  product_item_id: number;

  @ManyToOne(() => ProductItem)
  @JoinColumn({ name: 'product_item_id' })
  productItem: ProductItem;
}
