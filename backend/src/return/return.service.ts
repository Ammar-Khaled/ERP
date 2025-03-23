import { ConflictException, ConsoleLogger, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { ProductItem } from 'src/product_item/entities/product_item.entity';

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
    @Inject('PRODUCT_ITEM_REPOSITORY')
    private productItemRepository: Repository<ProductItem>,
  ) { }

  /// Utility Functions ///
  uniqueDtos(dtos) {
    // Returns the unique dtos
    // By merging the number of items for dtos with the same order item id

    return dtos.reduce(
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
  }

  async create(createReturnDto: CreateReturnDto) {
    const newReturn = new Return();

    newReturn.date = createReturnDto.date || new Date();
    if (createReturnDto.reason) {
      newReturn.reason = createReturnDto.reason;
    }

    // Handle return items //
    const returnItemDtos = createReturnDto.returnItemDtos;
    
    // Ensure that all order item ids are valid
    for (const itemDto of returnItemDtos) {
      const orderItem = await this.orderItemRepository.findOneBy({
        id: itemDto.orderItemId,
      });

      if (!orderItem) {
        throw new NotFoundException({
          message: `No order item with ID of (${itemDto.orderItemId})!`,
        });
      }
    }

    // Ensure that the return items are unique based on the order item id
    const uniquePurchaseItemsDtos = this.uniqueDtos(returnItemDtos);

    // Update the quantity of the product items
    const productItemsBuffer: ProductItem[] = [];
    for (const itemDto of uniquePurchaseItemsDtos) {
      const orderItem = await this.orderItemRepository.findOneBy({
        id: itemDto.orderItemId,
      });
      if (itemDto.numberOfItems > orderItem.numberOfItems) {
        throw new ConflictException({
          message: `The number of items to return is greater than the number of items in the order!`,
        });
      }

      const productItem = await this.productItemRepository.findOneBy({
        id: orderItem.productItem.id,
      });
      
      productItem.number_of_valid += itemDto.numberOfItems;
      productItemsBuffer.push(productItem);
    }

    // Save the product items and order items
    for (const productItem of productItemsBuffer) {
      await this.productItemRepository.save(productItem);
    }

    const returnItems: ReturnItem[] = [];
    for (const itemDto of uniquePurchaseItemsDtos) {
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
    const returnObj = await this.findOne(id);

    Object.assign(returnObj, updateReturnDto);

    // Handle return items //
    if (updateReturnDto.returnItemDtos) {
      // Ensure that the return items are unique based on the order item id
      const returnItemDtos = updateReturnDto.returnItemDtos;
      const uniqueReturnItemDtos = this.uniqueDtos(returnItemDtos);

      // console.log(uniqueReturnItemDtos);

      // Ensure the quantity is available for each item
      for (const itemDto of uniqueReturnItemDtos) {
        const orderItem = await this.orderItemRepository.findOneBy({
          id: itemDto.orderItemId,
        });
        //# Fix the bug
        if (itemDto.numberOfItems > orderItem.numberOfItems) {
          throw new ConflictException({
            message: `The number of items to return is greater than the number of items in the order!`,
          });
        }
      }

      console.log(returnObj.returnItems);

      // Update the items and save them
      for (const itemDto of uniqueReturnItemDtos) {
        // console.log(itemDto);

        const existingItem = returnObj.returnItems.find(
          (returnItem) => returnItem.orderItem.id === itemDto.orderItemId
        );

        // console.log('before if statement');

        if (existingItem) {
          // Found? => just update the quantity
          let difference = existingItem.numberOfItems - itemDto.numberOfItems;
          existingItem.orderItem.numberOfItems += difference;
          await this.orderItemRepository.save(existingItem.orderItem);

          existingItem.numberOfItems = itemDto.numberOfItems;
          await this.returnItemService.update(existingItem.id, existingItem);

          // console.log('finish if statement');
        } else {
          // Not found? => create a new item
          const orderItem = await this.orderItemRepository.findOneBy({
            id: itemDto.orderItemId,
          });

          orderItem.numberOfItems -= itemDto.numberOfItems;
          await this.orderItemRepository.save(orderItem);

          const returnItem = await this.returnItemService.create(itemDto);
          returnObj.returnItems.push(returnItem);

          // console.log('finish else statement');
        }
      }

      // Update the order //
      if (updateReturnDto.orderId) {
        const order = await this.orderRepository.findOneBy({
          id: updateReturnDto.orderId,
        });
        if (!order) {
          throw new NotFoundException({
            message: `No order with ID of (${updateReturnDto.orderId})!`,
          });
        }
        returnObj.order = order;
      }

      // Update the status //
      if (updateReturnDto.statusId) {
        const status = await this.statusRepository.findOneBy({
          id: updateReturnDto.statusId,
        });
        if (!status) {
          throw new NotFoundException({
            message: `No status with ID of (${updateReturnDto.statusId})!`,
          });
        }
        returnObj.status = status;
      }

      return await this.returnRepository.save(returnObj);
    }
  }

  async remove(id: number) {
    const returnObj = await this.findOne(id);
    await this.returnRepository.softDelete({id});
    return returnObj;
  }
}
