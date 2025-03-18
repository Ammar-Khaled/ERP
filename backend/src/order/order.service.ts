import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { User } from 'src/users/entities/user.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Coupon } from 'src/coupon/entities/coupon.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import * as jsend from 'jsend';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { OrderItemService } from 'src/order_item/order_item.service';
import { ProductItem } from '../product_item/entities/product_item.entity';
import { ProductItemService } from 'src/product_item/product_item.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject('ORDER_REPOSITORY')
    private orderRepo: Repository<Order>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepo: Repository<Branch>,
    @Inject('USER_REPOSITORY')
    private userRepo: Repository<User>,
    @Inject('CLIENT_REPOSITORY')
    private clientRepo: Repository<Client>,
    @Inject('COUPON_REPOSITORY')
    private couponRepo: Repository<Coupon>,
    @Inject('CURRENCY_REPOSITORY')
    private currencyRepo: Repository<Currency>,
    @Inject('ORDER_ITEM_REPOSITORY')
    private orderItemRepo: Repository<OrderItem>,
    @Inject('PRODUCT_ITEM_REPOSITORY')
    private productItemRepo: Repository<ProductItem>,
    private readonly orderItemService: OrderItemService,
    private readonly productItemService: ProductItemService,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    // Verify the existence of the branch
    const branch = await this.branchRepo.findOne({
      where: { id: createOrderDto.branch_id },
    });
    if (!branch) {
      throw new NotFoundException(
        jsend.fail({ message: 'There is NO branch with that id !!' }),
      );
    }

    // Verify the existence of the user
    const user = await this.userRepo.findOne({
      where: { id: createOrderDto.user_id },
    });
    if (!user) {
      throw new NotFoundException(
        jsend.fail({ message: 'There is NO user with that id !!' }),
      );
    }

    // Verify the existence of the client
    const client = await this.clientRepo.findOne({
      where: { id: createOrderDto.client_id },
    });
    if (!client) {
      throw new NotFoundException(
        jsend.fail({ message: 'There is NO client with that id !!' }),
      );
    }

    // the order doesn't necessarily has coupons,
    // so that, coupon_id is optional.
    // if its value doesn't equal to zero, we will check the existence of the coupon.
    if (createOrderDto.coupon_id > 0) {
      // Verify the existence of the coupon
      const coupon = await this.couponRepo.findOne({
        where: { id: createOrderDto.coupon_id },
      });
      if (!coupon) {
        throw new NotFoundException(
          jsend.fail({ message: 'There is NO coupon with that id !!' }),
        );
      }
    }

    // Verify the existence of the currency
    const currency = await this.currencyRepo.findOne({
      where: { id: createOrderDto.currency_id },
    });
    if (!currency) {
      throw new NotFoundException(
        jsend.fail({ message: 'There is NO currency with that id !!' }),
      );
    }

    const orderItems = [];
    for (const item of createOrderDto.items) {
      const orderItem = await this.orderItemRepo.create(item);
      const productItem = await this.productItemRepo.findOneBy({
        id: item.product_item_id,
      });
      orderItem.productItem = productItem;

      // make the price & name of same item equal in both of order_item and product_item
      orderItem.unit_price = productItem.price;
      orderItem.name = productItem.name;

      // validating the amount of items in the order and stock
      if (orderItem.numberOfItems > productItem.number_of_valid) {
        throw new ConflictException(
          jsend.fail({
            message: `There is NO enough items of ${productItem.name}`,
          }),
        );
      }
      productItem.number_of_valid -= orderItem.numberOfItems;
      await this.productItemService.update(productItem.id, productItem);

      // calculate total price for one order item
      orderItem.total_price = orderItem.unit_price * orderItem.numberOfItems;

      // calculate total amount of the order
      createOrderDto.total_amount += orderItem.total_price;

      await this.orderItemRepo.save(orderItem);
      orderItems.push(orderItem);
    }

    const order = this.orderRepo.create(createOrderDto);
    order.items = orderItems;

    try {
      const new_order = await this.orderRepo.save(order);
      return jsend.success(new_order);
    } catch (error) {
      throw new HttpException(
        jsend.error({
          message:
            'An unexpected error occurred while trying to save the order. Please, try again later.',
          data: error,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const orders = await this.orderRepo.find({ relations: ['items'] });
    return jsend.success(orders);
  }

  async findOne(id: number) {
    const order = await this.findOrderByCondition({ id }, 'Order Not Found !');
    return jsend.success(order);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOrderByCondition({ id }, 'Order Not Found !');

    if (updateOrderDto.coupon_id > 0) {
      // Verify the existence of the coupon
      const coupon = await this.couponRepo.findOne({
        where: { id: updateOrderDto.coupon_id },
      });
      if (!coupon) {
        throw new NotFoundException(
          jsend.fail({ message: 'There is NO coupon with that id !!' }),
        );
      }
      order.coupon_id = updateOrderDto.coupon_id;
    }

    if (updateOrderDto.currency_id > 0) {
      // Verify the existence of the currency
      const currency = await this.currencyRepo.findOne({
        where: { id: updateOrderDto.currency_id },
      });
      if (!currency) {
        throw new NotFoundException(
          jsend.fail({ message: 'There is NO currency with that id !!' }),
        );
      }
      order.currency_id = updateOrderDto.currency_id;
    }

    const newOrderItems = [];
    for (const item of updateOrderDto.items) {
      const productItem = await this.productItemRepo.findOneBy({
        id: item.product_item_id,
      });
      let flag: boolean;
      flag = false;
      item.unit_price = productItem.price;

      // This loop determine whether if the product_item_id of the orderItem coming
      // in updateOrderDto exists or not in the items of order
      for (let i = 0; i < order.items.length; ++i) {
        if (item.product_item_id === order.items[i].product_item_id) {
          // merge the new order item with the old one as they share same product item id
          if (item.number_of_items > order.items[i].numberOfItems) {
            // in case of more items are needed
            let difference: number = 0;
            difference = item.number_of_items - order.items[i].numberOfItems;
            if (difference > productItem.number_of_valid) {
              throw new ConflictException(
                jsend.fail({
                  message: `There is NO enough items of ${productItem.name}`,
                }),
              );
            }
            order.items[i].numberOfItems += difference;
            order.items[i].total_price +=
              difference * order.items[i].unit_price;
            order.total_amount += difference * order.items[i].unit_price;
            productItem.number_of_valid -= difference;
            await this.productItemService.update(productItem.id, productItem);
          } else if (item.number_of_items <= order.items[i].numberOfItems) {
            // in case of some items are returned
            const difference =
              order.items[i].numberOfItems - item.number_of_items;

            order.items[i].numberOfItems -= difference;
            order.items[i].total_price -=
              difference * order.items[i].unit_price;
            order.total_amount -= difference * order.items[i].unit_price;
            productItem.number_of_valid += difference;
            await this.productItemService.update(productItem.id, productItem);
          }
          flag = true;
          break;
        }
      }
      if (!flag) {
        // Add new order item that doesn't exist in old items array of order
        const orderItem = await this.orderItemRepo.create(item);
        orderItem.productItem = productItem;

        // make the price & name of same item equal in both of order_item and product_item
        orderItem.unit_price = productItem.price;
        orderItem.name = productItem.name;

        // validating the amount of items in the order and stock
        if (orderItem.numberOfItems > productItem.number_of_valid) {
          throw new ConflictException(
            jsend.fail({
              message: `There is NO enough items of ${productItem.name}`,
            }),
          );
        }
        productItem.number_of_valid -= orderItem.numberOfItems;
        await this.productItemService.update(productItem.id, productItem);

        // calculate total price for one order item
        orderItem.total_price =
          orderItem.unit_price * orderItem.numberOfItems;

        // calculate total amount of the order
        order.total_amount += orderItem.total_price;

        await this.orderItemRepo.save(orderItem);
        newOrderItems.push(orderItem);
      }
    }

    for (const orderItem of order.items) {
      await this.orderItemRepo.save(orderItem);
    }

    for (const order_item of newOrderItems) {
      order.items.push(order_item);
    }

    Object.assign(updateOrderDto, order);
    try {
      const updatedOrder = await this.orderRepo.save(updateOrderDto);
      return jsend.success(updatedOrder);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message: 'An error occurred while updating the Order.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    const order = await this.findOrderByCondition({ id }, 'Order Not Found !');
    for (const orderItem of order.items) {
      await this.orderItemRepo.softRemove(orderItem);
    }
    await this.orderRepo.softRemove(order);
    return jsend.success(order);
  }

  private async findOrderByCondition(condition: object, errorMessage: string) {
    const order = await this.orderRepo.findOne({
      where: condition,
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }
    return order;
  }
}
