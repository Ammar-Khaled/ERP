import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { Return } from './entities/return.entity';
import { CreateReturnItemDto } from 'src/return_item/dto/create-return_item.dto';
import { Repository } from 'typeorm';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { ReturnItem } from 'src/return_item/entities/return_item.entity';
import { ReturnItemService } from 'src/return_item/return_item.service';
import { Order } from 'src/order/entities/order.entity';
import { Status } from 'src/status/entities/status.entity';

@Injectable()
export class ReturnService {
  constructor(
    @Inject('RETURN_REPOSITORY')
    private returnRepository: Repository<Return>,
    @Inject('ORDER_ITEM_REPOSITORY')
    private orderItemRepository: Repository<OrderItem>,
    private returnItemService: ReturnItemService,
    @Inject('ORDER_REPOSITORY')
    private orderRepository: Repository<Order>,
    @Inject('STATUS_REPOSITORY')
    private statusRepository: Repository<Status>,
  ) {}
  
  async create(createReturnDto: CreateReturnDto) {
    const newReturn = new Return();

    newReturn.date = createReturnDto.date || new Date();
    if (createReturnDto.reason) {
      newReturn.reason = createReturnDto.reason;
    }

    // Handle return items //
    
    // Ensure that the return items are unique based on the order item id
    const returnItemDtos = createReturnDto.returnItemDtos;
    const uniquePurchaseItemsDtos = returnItemDtos.reduce(
      (visited, item) => {
        const existingItem = visited.find(
          (visitedItem) => visitedItem.orderItemId === item.orderItemId
        );
        if (existingItem) {
          existingItem.numberOfItems += item.numberOfItems;
        } else {
          visited.push(item);
        }

        return visited;
      },
      [] as CreateReturnItemDto[],
    );

    // Ensure the quantity is available for each item
    for (const itemDto of uniquePurchaseItemsDtos) {
      const orderItem = await this.orderItemRepository.findOneBy({
        id: itemDto.orderItemId,
      });
      if (itemDto.numberOfItems > orderItem.numberOfItems) {
        throw new ConflictException({
          message: `The number of items to return is greater than the number of items in the order!`,
        });
      } 
    }

    // Create the items and save them
    const returnItems: ReturnItem[] = [];
    for (const itemDto of uniquePurchaseItemsDtos) {
      const orderItem = await this.orderItemRepository.findOneBy({
        id: itemDto.orderItemId,
      });

      orderItem.numberOfItems -= itemDto.numberOfItems;
      await this.orderItemRepository.save(orderItem);
      
      const returnItem = await this.returnItemService.create(itemDto);
      returnItems.push(returnItem);
    }
    newReturn.returnItems = returnItems;

    // Handle the order //
    const order = await this.orderRepository.findOneBy({
      id: createReturnDto.orderId,
    });
    if (!order) {
      throw new NotFoundException({
        message: `No order with ID of (${createReturnDto.orderId})!`,
      });
    }
    newReturn.order = order;

    // Handle the status //
    const status = await this.statusRepository.findOneBy({
      id: createReturnDto.statusId,
    });
    if (!status) {
      throw new NotFoundException({
        message: `No status with ID of (${createReturnDto.statusId})!`,
      });
    }
    newReturn.status = status;

    return await this.returnRepository.save(newReturn);
  }

  async findAll() {
    return await this.returnRepository.find();
  }

  async findOne(id: number) {
    const returnObj = await this.returnRepository.findOneBy({ id });
    if (!returnObj) {
      throw new NotFoundException({
        message: `No return with ID of (${id})!`,
      });
    }

    return returnObj;
  }

  async update(id: number, updateReturnDto: UpdateReturnDto) {
    return `This action updates a #${id} return`;
  }

  async remove(id: number) {
    return `This action removes a #${id} return`;
  }
}
