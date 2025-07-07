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
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class OrderService extends BaseService<Order> {
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
  ) {
    super(orderRepo);
  }

  async create(createOrderDto: CreateOrderDto) {
    const newOrder = new Order();
    newOrder.date = createOrderDto.date || new Date();

    // Verify the existence of the inventory
    const inventory = await this.inventoryRepo.findOne({
      where: { id: createOrderDto.inventoryId },
    });
    if (!inventory) {
      throw new NotFoundException('There is NO inventory with that id !!');
    }
    newOrder.inventory = inventory;

    // Verify the existence of the branch
    const branch = await this.branchRepo.findOne({
      where: { id: createOrderDto.branchId },
    });
    if (!branch) {
      throw new NotFoundException('There is NO branch with that id !!');
    }
    newOrder.branch = branch;

    // Verify the existence of the user
    const user = await this.userRepo.findOne({
      where: { id: createOrderDto.userId },
    });
    if (!user) {
      throw new NotFoundException('There is NO user with that id !!');
    }
    newOrder.user = user;

    // Verify the existence of the client
    const client = await this.clientRepo.findOne({
      where: { id: createOrderDto.clientId },
    });
    if (!client) {
      throw new NotFoundException('There is NO client with that id !!');
    }
    newOrder.client = client;

    // Verify the existence of the status
    newOrder.status = await this.statusRepo.findOneBy({
      name: 'order_pending',
    });

    // Verify the existence of the currency
    const currency = await this.currencyRepo.findOne({
      where: { id: createOrderDto.currencyId },
    });
    if (!currency) {
      throw new NotFoundException('There is NO currency with that id !!');
    }
    newOrder.currency = currency;

    // Verify the existence of the coupon if provided
    if (createOrderDto.couponId) {
      const coupon = await this.couponRepo.findOne({
        where: { id: createOrderDto.couponId },
      });
      if (!coupon) {
        throw new NotFoundException('There is NO coupon with that id !!');
      }
      newOrder.coupon = coupon;
    }

    // Merge duplicate order items
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
        inventoryId: newOrder.inventoryId,
      });

      // make the price and name of the same item equal in both of order_item and product_item
      orderItem.unitPrice = productItem.price;
      orderItem.name = productItem.name;

      // validating the number of items in the order and stock
      if (orderItem.numberOfItems > productItemInv.numberOfValid) {
        throw new ConflictException(
          `There are NO enough items of ${productItem.name} in this stock at the moment`,
        );
      }

      // calculate the total price for one order item
      orderItem.totalPrice = orderItem.unitPrice * orderItem.numberOfItems;

      // calculate the total amount of the order
      orderItems.push(orderItem);
    }

    // Save the items and the order in the database in one transaction
    await this.orderRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // Save order items first
        for (const orderItem of orderItems) {
          await transactionalEntityManager.save(OrderItem, orderItem);
        }

        // Then save the order with the items
        newOrder.items = orderItems;
        return await transactionalEntityManager.save(Order, newOrder);
      },
    );

    return newOrder;
  }

  async findAll(
    paginationDto: PaginationDto,
    branchId: number,
  ): Promise<PaginatedResult<Order>> {
    return await super.findAll(paginationDto, branchId);
  }

  async findOne(id: number, branchId: number, relations?: string[]) {
    return await super.findOne(id, branchId, relations);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'status', 'coupon'],
    });

    // verify the order status is pending
    if (order.status.name !== 'order_pending') {
      throw new ConflictException('Order status must be pending to update it');
    }

    if (updateOrderDto.couponId) {
      // Verify the existence of the coupon
      const coupon = await this.couponRepo.findOne({
        where: { id: updateOrderDto.couponId },
      });
      if (!coupon) {
        throw new NotFoundException('There is NO coupon with that id !!');
      }
      order.coupon = coupon;
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
          // merge the new order item with the old one as they share the same product item id
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
          } else if (item.numberOfItems <= order.items[i].numberOfItems) {
            // in case of some items are returned
            const difference =
              order.items[i].numberOfItems - item.numberOfItems;

            order.items[i].numberOfItems -= difference;
            order.items[i].totalPrice -= difference * order.items[i].unitPrice;
          }
          flag = true;
          break;
        }
      }
      if (!flag) {
        // Add the new order item that doesn't exist in the old items array of order
        const orderItem = this.orderItemRepo.create(item);
        orderItem.productItem = productItem;

        // make the price and name of the same item equal in both of order_item and product_item
        orderItem.unitPrice = productItem.price;
        orderItem.name = productItem.name;

        // validating the number of items in the order and stock
        if (orderItem.numberOfItems > productItemInv.numberOfValid) {
          throw new ConflictException(
            `There are NO enough items of ${productItem.name} in the stock`,
          );
        }

        await this.orderItemRepo.save(orderItem);
        newOrderItems.push(orderItem);
      }
    }

    for (const orderItem of order.items) {
      await this.orderItemRepo.save(orderItem);
    }

    for (const orderItem of newOrderItems) {
      order.items.push(orderItem);
    }

    Object.assign(updateOrderDto, order);
    try {
      return await this.orderRepo.save(updateOrderDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'status'],
    });
    if (!order) {
      throw new NotFoundException('Order Not Found !');
    }

    // ensure status is completed or canceled
    if (
      order.status.name !== 'order_completed' &&
      order.status.name !== 'order_cancelled'
    ) {
      throw new ConflictException(
        'Order status must be completed or cancelled to delete it',
      );
    }

    await this.orderRepo.manager.transaction(
      async (transactionalEntityManager) => {
        for (const orderItem of order.items) {
          await transactionalEntityManager.softRemove(OrderItem, orderItem);
        }
        await transactionalEntityManager.softRemove(Order, order);
      },
    );

    return order;
  }

  async applyOrderFromInventory(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'status'],
    });
    if (!order) {
      throw new NotFoundException('Order Not Found !');
    }

    if (order.status.name !== 'order_pending') {
      throw new ConflictException(
        'Order status must be pending to apply it from inventory',
      );
    }

    // validating the number of items in the order and stock
    for (const orderItem of order.items) {
      const productItemInv = await this.productItemInventoryRepo.findOneBy({
        productItemId: orderItem.productItemId,
        inventoryId: order.inventoryId,
      });

      if (orderItem.numberOfItems > productItemInv.numberOfValid) {
        throw new ConflictException(
          `There are NO enough items of ${orderItem.name} in this stock at the moment`,
        );
      }
    }

    // Apply all inventory updates in a single transaction
    await this.orderRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // First, validate all order items have sufficient inventory
        const inventoryUpdates = [];

        for (const orderItem of order.items) {
          const productItemInv = await transactionalEntityManager.findOneBy(
            ProductItemToInventory,
            {
              productItemId: orderItem.productItemId,
              inventoryId: order.inventoryId,
            },
          );

          if (!productItemInv) {
            throw new NotFoundException(
              `Product item ID ${orderItem.productItemId} not found in inventory ID ${order.inventoryId}`,
            );
          }

          // validating the number of items in the order and stock
          if (orderItem.numberOfItems > productItemInv.numberOfValid) {
            throw new ConflictException(
              `There are NO enough items of ${orderItem.productItem.name} in this stock at the moment`,
            );
          }

          // Prepare the inventory update
          inventoryUpdates.push({
            entity: productItemInv,
            newNumberOfValid:
              productItemInv.numberOfValid - orderItem.numberOfItems,
          });
        }

        // Apply all inventory updates
        for (const update of inventoryUpdates) {
          await this.productItemInventoryService.update(update.entity.id, {
            numberOfValid: update.newNumberOfValid,
          });
        }

        // Update the order status to 'order_completed'
        const completedStatus = await transactionalEntityManager.findOneBy(
          Status,
          {
            name: 'order_completed',
          },
        );
        if (completedStatus) {
          order.status = completedStatus;
          await transactionalEntityManager.save(Order, order);
        }
      },
    );
  }

  async cancelOrder(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['status'],
    });
    if (!order) {
      throw new NotFoundException('Order Not Found !');
    }

    // ensure status is pending
    if (order.status.name !== 'order_pending') {
      throw new ConflictException('Order status must be pending to cancel it');
    }

    // Update order status to cancelled
    order.status = await this.statusRepo.findOneBy({ name: 'order_cancelled' });
    return this.orderRepo.save(order);
  }
}
