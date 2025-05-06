import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReturnItemDto } from './dto/create-return_item.dto';
import { UpdateReturnItemDto } from './dto/update-return_item.dto';
import { Repository } from 'typeorm';
import { ReturnItem } from './entities/return_item.entity';
import { OrderItem } from 'src/order/entities/order_item.entity';

@Injectable()
export class ReturnItemService {
  constructor(
    @Inject('RETURN_ITEM_REPOSITORY') private returnItemRepository: Repository<ReturnItem>,
    @Inject('ORDER_ITEM_REPOSITORY') private orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(createReturnItemDto: CreateReturnItemDto) {
    const existingOrderItem = await this.orderItemRepository.findOneBy({
      id: createReturnItemDto.orderItemId,
    });
    if (!existingOrderItem) {
      throw new NotFoundException(
        `Order item with id ${createReturnItemDto.orderItemId} not found`,
      );
    }

    const returnItem =
      await this.returnItemRepository.create(createReturnItemDto);
    returnItem.orderItem = existingOrderItem;
    returnItem.name = existingOrderItem.name;

    // update the order item number of returned
    existingOrderItem.numberOfReturned += createReturnItemDto.numberOfItems;
    await this.orderItemRepository.save(existingOrderItem);

    return await this.returnItemRepository.save(returnItem);
  }

  async findAll() {
    return await this.returnItemRepository.find();
  }

  async findOne(id: number) {
    const returnItem = await this.returnItemRepository.findOneBy({ id });
    if (!returnItem) {
      throw new NotFoundException(`Return item with id ${id} not found`);
    }

    return returnItem;
  }

  async update(id: number, updateReturnItemDto: UpdateReturnItemDto) {
    const returnItem = await this.findOne(id);

    // update #returned in orderItem
    const difference = updateReturnItemDto.numberOfItems - returnItem.numberOfItems;
    returnItem.orderItem.numberOfReturned += difference;
    await this.orderItemRepository.save(returnItem.orderItem);

    Object.assign(returnItem, updateReturnItemDto);
    return await this.returnItemRepository.save(returnItem);
  }

  async remove(id: number) {
    const returnItem = await this.findOne(id);

    // update #returned in orderItem
    returnItem.orderItem.numberOfReturned -= returnItem.numberOfItems;
    await this.orderItemRepository.save(returnItem.orderItem);

    await this.returnItemRepository.softDelete({ id });
    return returnItem;
  }
}
