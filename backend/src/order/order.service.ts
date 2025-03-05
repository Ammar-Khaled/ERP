import {
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
    private readonly orderItemService: OrderItemService,
  ) {}

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

  findAll(): string {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
