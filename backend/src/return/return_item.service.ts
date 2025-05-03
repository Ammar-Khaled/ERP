import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReturnItemDto } from './dto/create-return_item.dto';
import { UpdateReturnItemDto } from './dto/update-return_item.dto';

@Injectable()
export class ReturnItemService {
  constructor(
    @Inject('RETURN_ITEM_REPOSITORY') private returnItemRepository,
    @Inject('ORDER_ITEM_REPOSITORY') private orderItemRepository,
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

    Object.assign(returnItem, updateReturnItemDto);

    if (updateReturnItemDto.orderItemId) {
      const existingOrderItem = await this.orderItemRepository.findOneBy({
        id: updateReturnItemDto.orderItemId,
      });
      if (!existingOrderItem) {
        throw new NotFoundException(
          `Order item with id ${updateReturnItemDto.orderItemId} not found`,
        );
      }
      returnItem.orderItem = existingOrderItem;
    }

    return await this.returnItemRepository.save(returnItem);
  }

  async remove(id: number) {
    const returnItem = await this.findOne(id);
    await this.returnItemRepository.softDelete({ id });
    return returnItem;
  }
}
