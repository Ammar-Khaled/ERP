import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { Return } from './entities/return.entity';
import { CreateReturnItemDto } from 'src/return/dto/create-return_item.dto';
import { Repository } from 'typeorm';
import { OrderItem } from 'src/order/entities/order_item.entity';
import { ReturnItem } from 'src/return/entities/return_item.entity';
import { ReturnItemService } from 'src/return/return_item.service';
import { Order } from 'src/order/entities/order.entity';
import { Status } from 'src/status/entities/status.entity';
import { ProductItemToInventory } from 'src/product_item_inventory/entities/product_item_inventory.entity';
import { ProductItemInventoryService } from 'src/product_item_inventory/product_item_inventory.service';
import { UpdateProductItemInventoryDto } from 'src/product_item_inventory/dto/update-product_item_inventory.dto';

@Injectable()
export class ReturnService {
  constructor(
    private returnItemService: ReturnItemService,
    private productItemInvService: ProductItemInventoryService,

    @Inject('RETURN_REPOSITORY')
    private returnRepository: Repository<Return>,
    @Inject('ORDER_ITEM_REPOSITORY')
    private orderItemRepository: Repository<OrderItem>,
    @Inject('ORDER_REPOSITORY')
    private orderRepository: Repository<Order>,
    @Inject('STATUS_REPOSITORY')
    private statusRepository: Repository<Status>,
    @Inject('PRODUCT_ITEM_INVENTORY_REPOSITORY')
    private productItemInvRepository: Repository<ProductItemToInventory>,
  ) {}

  /// Utility Functions ///
  uniqueDtos(dtos: CreateReturnItemDto[]) {
    // Returns the unique dtos
    // By merging the number of items for dtos with the same order item id

    return dtos.reduce((visited, item) => {
      const existingItem = visited.find(
        (visitedItem) => visitedItem.orderItemId === item.orderItemId,
      );
      if (existingItem) {
        existingItem.numberOfItems += item.numberOfItems;
      } else {
        visited.push(item);
      }

      return visited;
    }, [] as CreateReturnItemDto[]);
  }

  validateAllOrderItemIds(dtos: CreateReturnItemDto[]): boolean {
    // Returns true if all order item ids are valid
    return dtos.every((item) =>
      this.orderItemRepository.findOneBy({ id: item.orderItemId }),
    );
  }

  /// CRUD Functions ///

  async create(createReturnDto: CreateReturnDto) {
    const newReturn = new Return();

    newReturn.date = createReturnDto.date || new Date();
    if (createReturnDto.reason) {
      newReturn.reason = createReturnDto.reason;
    }
    if (createReturnDto.reasonAr) {
      newReturn.reasonAr = createReturnDto.reasonAr;
    }

    // Handle the order //
    const order = await this.orderRepository.findOneBy({
      id: createReturnDto.orderId,
    });
    if (!order) {
      throw new NotFoundException({
        message: `No order with ID of (${createReturnDto.orderId})!`,
      });
    }
    newReturn.order = order; // will be used also to handle PII

    // Handle return items //
    const returnItemDtos = createReturnDto.returnItemDtos;

    // Ensure that all order item ids are valid
    if (!this.validateAllOrderItemIds(returnItemDtos)) {
      throw new NotFoundException({
        message: `One or more order item ids are invalid!`,
      });
    }

    // Ensure that the return items are unique based on the order item id
    const uniqueReturnItemsDtos = this.uniqueDtos(returnItemDtos);

    // Update the quantity of the product items
    const productItemsInvBuffer: ProductItemToInventory[] = [];
    for (const itemDto of uniqueReturnItemsDtos) {
      const orderItem = await this.orderItemRepository.findOneBy({
        id: itemDto.orderItemId,
      });

      if (
        itemDto.numberOfItems >
        orderItem.numberOfItems - orderItem.numberOfReturned
      ) {
        throw new ConflictException({
          message: `The number of items to return is greater than the number of items in the order!`,
        });
      }

      const productItemInv = await this.productItemInvRepository.findOneBy({
        productItemId: orderItem.productItemId,
        inventoryId: order.inventoryId,
      });
      if (!productItemInv)
        throw new NotFoundException(
          `No product item of id ${orderItem.productItemId} in the inventory ${order.inventoryId}!`,
        );
      productItemInv.numberOfValid += itemDto.numberOfItems; // inventory quantity

      productItemsInvBuffer.push(productItemInv);
    }

    // Save the product items
    for (const productItemInv of productItemsInvBuffer) {
      const updateDto = new UpdateProductItemInventoryDto();
      updateDto.numberOfValid = productItemInv.numberOfValid;
      await this.productItemInvService.update(productItemInv.id, updateDto);
    }

    const returnItems: ReturnItem[] = [];
    for (const itemDto of uniqueReturnItemsDtos) {
      const returnItem = await this.returnItemService.create(itemDto);
      returnItems.push(returnItem);
    }
    newReturn.returnItems = returnItems;

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

  async findOne(id: number, relations: string[] = []) {
    const returnObj = await this.returnRepository.findOne({
      where: { id },
      relations: relations,
    });
    if (!returnObj) {
      throw new NotFoundException({
        message: `No return with ID of (${id})!`,
      });
    }

    return returnObj;
  }

  async update(id: number, updateReturnDto: UpdateReturnDto) {
    const returnObj = await this.findOne(id, ['order']); // get with order relation to access the inventory

    Object.assign(returnObj, updateReturnDto);

    // Handle return items //

    if (updateReturnDto.returnItemDtos) {
      const returnItemDtos = updateReturnDto.returnItemDtos;
      // Ensure that all order item ids are valid
      if (!this.validateAllOrderItemIds(returnItemDtos)) {
        throw new NotFoundException({
          message: `One or more order item ids are invalid!`,
        });
      }

      // Ensure that the return items are unique based on the order item id
      const uniqueReturnItemDtos = this.uniqueDtos(returnItemDtos);

      // Update the product items and the return items
      // Note: Store the data in temp lists before saving to achieve atomicity
      const productItemsInvBuffer: ProductItemToInventory[] = [];
      const returnItemsToUpdate: ReturnItem[] = [];
      const returnItemsToAdd: CreateReturnItemDto[] = [];
      for (const itemDto of uniqueReturnItemDtos) {
        const existingItem = returnObj.returnItems.find(
          (returnItem) => returnItem.orderItem.id === itemDto.orderItemId,
        );

        if (existingItem) {
          // Found? => just update the quantity of both the product item and the return item

          // Validate the number of returned items
          if (
            itemDto.numberOfItems - existingItem.numberOfItems >
            existingItem.orderItem.numberOfItems -
              existingItem.orderItem.numberOfReturned
          ) {
            throw new ConflictException({
              message: `The number of items to return is greater than the number of items in the order of the ID (${itemDto.orderItemId})!`,
            });
          }
          const difference = itemDto.numberOfItems - existingItem.numberOfItems;

          // update the product item quantity
          const productItemInv = await this.productItemInvRepository.findOneBy({
            productItemId: existingItem.orderItem.productItemId,
            inventoryId: returnObj.order.inventoryId,
          });
          productItemInv.numberOfValid += difference; // inventory quantity
          productItemsInvBuffer.push(productItemInv);

          // update the return quantity
          existingItem.numberOfItems = itemDto.numberOfItems;
          returnItemsToUpdate.push(existingItem);
        } else {
          // Not found? => create a new item

          // Validate the quantity to be returned
          const orderItem = await this.orderItemRepository.findOneBy({
            id: itemDto.orderItemId,
          });
          if (itemDto.numberOfItems > orderItem.numberOfItems) {
            throw new ConflictException({
              message: `The number of items to return is greater than the number of items in the order of the ID (${itemDto.orderItemId})!`,
            });
          }

          // Update the quantities
          const productItemInv = await this.productItemInvRepository.findOneBy({
            productItemId: orderItem.productItemId,
            inventoryId: returnObj.order.inventoryId,
          });
          productItemInv.numberOfValid += itemDto.numberOfItems; // inventory quantity
          productItemsInvBuffer.push(productItemInv);

          returnItemsToAdd.push(itemDto);
        }
      }

      // Save the temp lists
      for (const productItemInv of productItemsInvBuffer) {
        const updateDto = new UpdateProductItemInventoryDto();
        updateDto.numberOfValid = productItemInv.numberOfValid;
        await this.productItemInvService.update(productItemInv.id, updateDto);
      }
      for (const returnItem of returnItemsToUpdate) {
        await this.returnItemService.update(returnItem.id, returnItem);
      }
      for (const returnItemDto of returnItemsToAdd) {
        const returnItem = await this.returnItemService.create(returnItemDto);
        returnObj.returnItems.push(returnItem);
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
    const returnObj = await this.findOne(id, ['order']);

    // delete all return items
    try {
      for (const returnItem of returnObj.returnItems) {
        // update the product item quantity
        const productItemInv = await this.productItemInvRepository.findOneBy({
          productItemId: returnItem.orderItem.productItemId,
          inventoryId: returnObj.order.inventoryId,
        });
        productItemInv.numberOfValid -= returnItem.numberOfItems;

        const updateDto = new UpdateProductItemInventoryDto();
        updateDto.numberOfValid = productItemInv.numberOfValid;
        await this.productItemInvService.update(productItemInv.id, updateDto);

        // then remove it
        await this.returnItemService.remove(returnItem.id);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }

    await this.returnRepository.softRemove({ id });
    return returnObj;
  }
}
