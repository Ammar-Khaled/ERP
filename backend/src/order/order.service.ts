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
import { Client } from 'src/clients/entities/client.entity';
import { Branch } from '../branches/entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { Currency } from '../currency/entities/currency.entity';
import { ProductItemInventoryService } from '../product_item_inventory/product_item_inventory.service';
import { OrderItem } from './entities/order_item.entity';
import { ProductItem } from 'src/product_item/entities/product_item.entity';
import { CreateOrderItemDto } from './dto/create-order_item.dto';
import { ProductItemToInventory } from 'src/product_item_inventory/entities/product_item_inventory.entity';
import { Status } from 'src/status/entities/status.entity';
import { Coupon } from 'src/coupon/entities/coupon.entity';
import { Inventory } from 'src/inventories/entities/inventory.entity';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';

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
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepo: Repository<Inventory>,
    private readonly productItemInventoryService: ProductItemInventoryService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const _newOrder = new Order();
    _newOrder.date = createOrderDto.date || new Date();

    // Verify the existence of the inventory
    const inventory = await this.inventoryRepo.findOne({
      where: { id: createOrderDto.inventoryId },
    });
    if (!inventory) {
      throw new NotFoundException('There is NO inventory with that id !!');
    }
    _newOrder.inventory = inventory;

    // Verify the existence of the branch
    const branch = await this.branchRepo.findOne({
      where: { id: createOrderDto.branchId },
    });
    if (!branch) {
      throw new NotFoundException('There is NO branch with that id !!');
    }
    _newOrder.branch = branch;

    // Verify the existence of the user
    const user = await this.userRepo.findOne({
      where: { id: createOrderDto.userId },
    });
    if (!user) {
      throw new NotFoundException('There is NO user with that id !!');
    }
    _newOrder.user = user;

    // Verify the existence of the client
    const client = await this.clientRepo.findOne({
      where: { id: createOrderDto.clientId },
    });
    if (!client) {
      throw new NotFoundException('There is NO client with that id !!');
    }
    _newOrder.client = client;

    // Verify the existence of the status
    const status = await this.statusRepo.findOneBy({
      id: createOrderDto.statusId,
    });
    if (!status)
      throw new NotFoundException('There is NO status with that id !!');
    _newOrder.status = status;

    // the order doesn't necessarily has coupons,
    // so that, coupon_id is optional.
    // if its value doesn't equal to zero, we will check the existence of the coupon.
    if (createOrderDto.couponId > 0) {
      // Verify the existence of the coupon
      const coupon = await this.couponRepo.findOne({
        where: { id: createOrderDto.couponId },
      });
      if (!coupon) {
        throw new NotFoundException('There is NO coupon with that id !!');
      }
      _newOrder.coupon = coupon;
    }

    // Verify the existence of the currency
    const currency = await this.currencyRepo.findOne({
      where: { id: createOrderDto.currencyId },
    });
    if (!currency) {
      throw new NotFoundException('There is NO currency with that id !!');
    }
    _newOrder.currency = currency;

    const _orderItems = createOrderDto.items;
    const uniqueOrderItems = _orderItems.reduce((merged, item) => {
      const existingItem = merged.find(
        (i) => i.productItemId === item.productItemId,
      );
      if (existingItem) existingItem.numberOfItems += item.numberOfItems;
      else merged.push(item);

      return merged;
    }, [] as CreateOrderItemDto[]);

    const orderItems = [];
    for (const item of uniqueOrderItems) {
      const orderItem = this.orderItemRepo.create(item);
      const productItem = await this.productItemRepo.findOneBy({
        id: item.productItemId,
      });
      orderItem.productItem = productItem;

      const productItemInv = await this.productItemInventoryRepo.findOneBy({
        productItemId: orderItem.productItemId,
        inventoryId: _newOrder.inventoryId,
      });

      // make the price & name of same item equal in both of order_item and product_item
      orderItem.unitPrice = productItem.price;
      orderItem.name = productItem.name;

      // validating the amount of items in the order and stock
      if (orderItem.numberOfItems > productItemInv.numberOfValid) {
        throw new ConflictException(
          `There are NO enough items of ${productItem.name} in this stock at the moment`,
        );
      }

      productItemInv.numberOfValid -= orderItem.numberOfItems;
      await this.productItemInventoryService.update(productItemInv.id, {
        numberOfValid: productItemInv.numberOfValid,
      });

      // calculate total price for one order item
      orderItem.totalPrice = orderItem.unitPrice * orderItem.numberOfItems;

      // calculate total amount of the order
      _newOrder.totalAmount += orderItem.totalPrice;

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

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Order>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.orderRepo.findAndCount({
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number, withRelations: boolean = false) {
    let order;

    if (withRelations) {
      order = await this.orderRepo.findOne({
        where: { id },
        relations: [
          'branch',
          'inventory',
          'user',
          'client',
          'status',
          'coupon',
          'currency',
          'items',
          'returns',
        ],
      });
    } else {
      order = await this.orderRepo.findOneBy({ id });
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOrderByCondition({ id }, 'Order Not Found !');

    if (updateOrderDto.couponId > 0) {
      // Verify the existence of the coupon
      const coupon = await this.couponRepo.findOne({
        where: { id: updateOrderDto.couponId },
      });
      if (!coupon) {
        throw new NotFoundException('There is NO coupon with that id !!');
      }
      order.couponId = updateOrderDto.couponId;
    }

    if (updateOrderDto.currencyId > 0) {
      // Verify the existence of the currency
      const currency = await this.currencyRepo.findOne({
        where: { id: updateOrderDto.currencyId },
      });
      if (!currency) {
        throw new NotFoundException('There is NO currency with that id !!');
      }
      order.currencyId = updateOrderDto.currencyId;
    }

    const newOrderItems = [];
    for (let c = 0; c < updateOrderDto.items.length; ++c) {
      const item = new OrderItem();
      item.numberOfItems = updateOrderDto.items[c].numberOfItems;
      item.productItemId = updateOrderDto.items[c].productItemId;

      const productItem = await this.productItemRepo.findOneBy({
        id: item.productItemId,
      });

      const productItemInv = await this.productItemInventoryRepo.findOneBy({
        productItemId: item.productItemId,
        inventoryId: order.inventoryId,
      });

      let flag: boolean = false;
      item.unitPrice = productItem.price;
      item.name = productItem.name;

      // This loop determines whether if the productItemId of the orderItem coming
      // in updateOrderDto exists or not in the items of order
      for (let i = 0; i < order.items.length; ++i) {
        if (item.productItemId === order.items[i].productItemId) {
          // merge the new order item with the old one as they share same product item id
          if (item.numberOfItems > order.items[i].numberOfItems) {
            // in case of more items are needed

            const difference: number =
              item.numberOfItems - order.items[i].numberOfItems;
            if (difference > productItemInv.numberOfValid) {
              throw new ConflictException(
                `There are NO enough items of ${productItem.name} in the stock`,
              );
            }

            order.items[i].numberOfItems += difference;
            order.items[i].totalPrice += difference * order.items[i].unitPrice;

            order.totalAmount += difference * order.items[i].unitPrice;
            productItemInv.numberOfValid -= difference;
            await this.productItemInventoryService.update(
              productItemInv.id,
              productItemInv,
            );
          } else if (item.numberOfItems <= order.items[i].numberOfItems) {
            // in case of some items are returned
            const difference =
              order.items[i].numberOfItems - item.numberOfItems;

            order.items[i].numberOfItems -= difference;
            order.items[i].totalPrice -= difference * order.items[i].unitPrice;

            order.totalAmount -= difference * order.items[i].unitPrice;
            productItemInv.numberOfValid += difference;
            await this.productItemInventoryService.update(
              productItemInv.id,
              productItemInv,
            );
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
        orderItem.unitPrice = productItem.price;
        orderItem.name = productItem.name;

        // validating the amount of items in the order and stock
        if (orderItem.numberOfItems > productItemInv.numberOfValid) {
          throw new ConflictException(
            `There are NO enough items of ${productItem.name} in the stock`,
          );
        }

        productItemInv.numberOfValid -= orderItem.numberOfItems;
        await this.productItemInventoryService.update(
          productItemInv.id,
          productItemInv,
        );

        // calculate total price for one order item
        orderItem.totalPrice = orderItem.unitPrice * orderItem.numberOfItems;

        // calculate total amount of the order
        order.totalAmount += orderItem.totalPrice;

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
    const inventoryId = order.inventoryId;
    for (const orderItem of order.items) {
      await this.orderItemRepo.softRemove(orderItem);

      const pii = await this.productItemInventoryRepo.findOneBy({
        inventoryId,
        productItemId: orderItem.productItemId,
      });
      if (!pii) {
        throw new NotFoundException(
          `ProductItemInventory with inventoryId ${inventoryId} and productItemId ${orderItem.productItemId} not found`,
        );
      }

      pii.numberOfValid += orderItem.numberOfItems;
      await this.productItemInventoryService.update(pii.id, pii); // will also update the product item table
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
