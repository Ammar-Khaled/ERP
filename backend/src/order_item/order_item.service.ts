import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order_item.dto';
import { UpdateOrderItemDto } from './dto/update-order_item.dto';
import { OrderItem } from './entities/order_item.entity';
import { Repository } from 'typeorm';
import * as jsend from 'jsend';

@Injectable()
export class OrderItemService {
  constructor(
    @Inject('ORDER_ITEM_REPOSITORY')
    private orderItemRepo : Repository<OrderItem>
  ){}


  async create(createOrderItemDto: CreateOrderItemDto) {
    
  }

  findAll() {
    return `This action returns all orderItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderItem`;
  }

  update(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    return `This action updates a #${id} orderItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderItem`;
  }
}
