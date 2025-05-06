import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { ProductItem } from 'src/product_item/entities/product_item.entity';
import { ReturnItem } from 'src/return/entities/return_item.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  numberOfItems: number;

  @Column()
  numberOfReturned: number = 0;

  @Column({ type: 'float', default: 0.0 })
  unitPrice: number;

  @Column({ type: 'float', default: 0.0 })
  totalPrice: number;

  @DeleteDateColumn()
  deletedAt: Date;

  //---------------

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  //---------------

  @Column()
  productItemId: number;

  @ManyToOne(() => ProductItem, {
    eager: true,
  })
  @JoinColumn({ name: 'productItemId' })
  productItem: ProductItem;

  @OneToMany(() => ReturnItem, (returnItem) => returnItem.orderItem)
  returnItems: ReturnItem;
}
