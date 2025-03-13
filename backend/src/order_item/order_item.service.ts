import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order_item.dto';
import { UpdateOrderItemDto } from './dto/update-order_item.dto';
import { OrderItem } from './entities/order_item.entity';
import { Repository } from 'typeorm';
import * as jsend from 'jsend';

@Injectable()
export class OrderItemService {
  constructor(
    @Inject('ORDER_ITEM_REPOSITORY')
    private orderItemRepo: Repository<OrderItem>,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto) {
    await this.orderItemRepo.save(createOrderItemDto);
  }

  async findAll() {
    const orderItems = await this.orderItemRepo.find();
    return jsend.success(orderItems);
  }

  async findOne(id: number) {
    const orderItem = await this.orderItemRepo.findOneBy({id});
    if(!orderItem){
      throw new NotFoundException({
        message: `There is NO order item with id : ${id}`
      });
    }
    return jsend.success(orderItem);
  }

  update(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    return `This action updates a #${id} orderItem`;
  }

  async remove(id: number){
    await this.orderItemRepo.delete({id});
  }
}
