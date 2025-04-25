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
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { ProductItem } from '../product_item/entities/product_item.entity';
import { ProductItemService } from 'src/product_item/product_item.service';
import { CreateOrderItemDto } from 'src/order_item/dto/create-order_item.dto';
import { Status } from 'src/status/entities/status.entity';
import { ProductItemToInventory } from 'src/product_item_inventory/entities/product_item_inventory.entity';
import { ProductItemInventoryService } from 'src/product_item_inventory/product_item_inventory.service';

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
    @Inject('STATUS_REPOSITORY')
    private statusRepo: Repository<Status>,
    @Inject('PRODUCT_ITEM_INVENTORY_REPOSITORY')
    private productItemInventoryRepo: Repository<ProductItemToInventory>,
    private readonly productItemService: ProductItemService,
    private readonly productItemInventoryService: ProductItemInventoryService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const _newOrder = new Order();
    _newOrder.date = createOrderDto.date || new Date();

    // Verify the existence of the branch
    const branch = await this.branchRepo.findOne({
      where: { id: createOrderDto.branch_id },
    });
    if (!branch) {
      throw new NotFoundException('There is NO branch with that id !!');
    }
    _newOrder.branch = branch;

    // Verify the existence of the user
    const user = await this.userRepo.findOne({
      where: { id: createOrderDto.user_id },
    });
    if (!user) {
      throw new NotFoundException('There is NO user with that id !!');
    }
    _newOrder.user = user;

    // Verify the existence of the client
    const client = await this.clientRepo.findOne({
      where: { id: createOrderDto.client_id },
    });
    if (!client) {
      throw new NotFoundException('There is NO client with that id !!');
    }
    _newOrder.client = client;

    // Verify the existence of the status
    const status = await this.statusRepo.findOneBy({
      id: createOrderDto.status_id,
    });
    if (!status)
      throw new NotFoundException('There is NO status with that id !!');
    _newOrder.status = status;

    // the order doesn't necessarily has coupons,
    // so that, coupon_id is optional.
    // if its value doesn't equal to zero, we will check the existence of the coupon.
    if (createOrderDto.coupon_id > 0) {
      // Verify the existence of the coupon
      const coupon = await this.couponRepo.findOne({
        where: { id: createOrderDto.coupon_id },
      });
      if (!coupon) {
        throw new NotFoundException('There is NO coupon with that id !!');
      }
      _newOrder.coupon = coupon;
    }

    // Verify the existence of the currency
    const currency = await this.currencyRepo.findOne({
      where: { id: createOrderDto.currency_id },
    });
    if (!currency) {
      throw new NotFoundException('There is NO currency with that id !!');
    }
    _newOrder.currency = currency;

    const _orderItems = createOrderDto.items;
    const uniqueOrderItems = _orderItems.reduce((merged, item) => {
      const existingItem = merged.find(
        (i) => i.product_item_id === item.product_item_id,
      );
      if (existingItem) existingItem.number_of_items += item.number_of_items;
      else merged.push(item);

      return merged;
    }, [] as CreateOrderItemDto[]);

    const orderItems = [];
    for (const item of uniqueOrderItems) {
      const orderItem = await this.orderItemRepo.create(item);
      const productItem = await this.productItemRepo.findOneBy({
        id: item.product_item_id,
      });
      orderItem.productItem = productItem;

      const productItemInv = await this.productItemInventoryRepo.findOneBy({
        product_item_id: orderItem.product_item_id,
        inventory_id: _newOrder.inventory_id,
      });

      // make the price & name of same item equal in both of order_item and product_item
      orderItem.unit_price = productItem.price;
      orderItem.name = productItem.name;

      // validating the amount of items in the order and stock
      if (orderItem.numberOfItems > productItemInv.number_of_items) {
        throw new ConflictException(
          `There are NO enough items of ${productItem.name} in this stock at the moment`,
        );
      }

      productItemInv.number_of_items -= orderItem.numberOfItems;
      await this.productItemInventoryService.update(
        productItemInv.id,
        productItemInv,
      );

      productItem.number_of_valid -= orderItem.numberOfItems;
      await this.productItemService.update(productItem.id, productItem);

      // calculate total price for one order item
      orderItem.total_price = orderItem.unit_price * orderItem.numberOfItems;

      // calculate total amount of the order
      _newOrder.total_amount += orderItem.total_price;

      await this.orderItemRepo.save(orderItem);
      orderItems.push(orderItem);
    }

    _newOrder.items = orderItems;

    try {
      return await this.orderRepo.save(_newOrder);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    return await this.orderRepo.find({ relations: ['items'] });
  }

  async findOne(id: number) {
    return await this.findOrderByCondition({ id }, 'Order Not Found !');
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOrderByCondition({ id }, 'Order Not Found !');

    if (updateOrderDto.coupon_id > 0) {
      // Verify the existence of the coupon
      const coupon = await this.couponRepo.findOne({
        where: { id: updateOrderDto.coupon_id },
      });
      if (!coupon) {
        throw new NotFoundException('There is NO coupon with that id !!');
      }
      order.coupon_id = updateOrderDto.coupon_id;
    }

    if (updateOrderDto.currency_id > 0) {
      // Verify the existence of the currency
      const currency = await this.currencyRepo.findOne({
        where: { id: updateOrderDto.currency_id },
      });
      if (!currency) {
        throw new NotFoundException('There is NO currency with that id !!');
      }
      order.currency_id = updateOrderDto.currency_id;
    }

    const newOrderItems = [];
    for (let c = 0; c < updateOrderDto.items.length; ++c) {
      const item = new OrderItem();
      item.numberOfItems = updateOrderDto.items[c].number_of_items;
      item.product_item_id = updateOrderDto.items[c].product_item_id;

      const productItem = await this.productItemRepo.findOneBy({
        id: item.product_item_id,
      });

      const productItemInv = await this.productItemInventoryRepo.findOneBy({
        product_item_id: item.product_item_id,
        inventory_id: order.inventory_id,
      });

      let flag: boolean = false;
      item.unit_price = productItem.price;
      item.name = productItem.name;

      // This loop determines whether if the product_item_id of the orderItem coming
      // in updateOrderDto exists or not in the items of order
      for (let i = 0; i < order.items.length; ++i) {
        if (item.product_item_id === order.items[i].product_item_id) {
          // merge the new order item with the old one as they share same product item id
          if (item.numberOfItems > order.items[i].numberOfItems) {
            // in case of more items are needed

            const difference: number =
              item.numberOfItems - order.items[i].numberOfItems;
            if (difference > productItemInv.number_of_items) {
              throw new ConflictException(
                `There are NO enough items of ${productItem.name} in the stock`,
              );
            }

            order.items[i].numberOfItems += difference;
            order.items[i].total_price +=
              difference * order.items[i].unit_price;

            order.total_amount += difference * order.items[i].unit_price;
            productItemInv.number_of_items -= difference;
            await this.productItemInventoryService.update(
              productItemInv.id,
              productItemInv,
            );
            productItem.number_of_valid -= difference;
            await this.productItemService.update(productItem.id, productItem);
          } else if (item.numberOfItems <= order.items[i].numberOfItems) {
            // in case of some items are returned
            const difference =
              order.items[i].numberOfItems - item.numberOfItems;

            order.items[i].numberOfItems -= difference;
            order.items[i].total_price -=
              difference * order.items[i].unit_price;

            order.total_amount -= difference * order.items[i].unit_price;
            productItemInv.number_of_items += difference;
            await this.productItemInventoryService.update(
              productItemInv.id,
              productItemInv,
            );
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
        if (orderItem.numberOfItems > productItemInv.number_of_items) {
          throw new ConflictException(
            `There are NO enough items of ${productItem.name} in the stock`,
          );
        }

        productItemInv.number_of_items -= orderItem.numberOfItems;
        await this.productItemInventoryService.update(
          productItemInv.id,
          productItemInv,
        );
        productItem.number_of_valid -= orderItem.numberOfItems;
        await this.productItemService.update(productItem.id, productItem);

        // calculate total price for one order item
        orderItem.total_price = orderItem.unit_price * orderItem.numberOfItems;

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
      return await this.orderRepo.save(updateOrderDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const order = await this.findOrderByCondition({ id }, 'Order Not Found !');
    for (const orderItem of order.items) {
      await this.orderItemRepo.softRemove(orderItem);
    }
    await this.orderRepo.softRemove(order);
    return order;
  }

  private async findOrderByCondition(condition: object, errorMessage: string) {
    const order = await this.orderRepo.findOne({
      where: condition,
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(errorMessage);
    }
    return order;
  }
}
