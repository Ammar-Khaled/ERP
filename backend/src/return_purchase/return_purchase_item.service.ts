import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ReturnPurchaseItem } from './entities/return_purchase_item.entity';
import { PurchaseItem } from 'src/purchase_request/entities/purchase_item.entity';
import { CreateReturnPurchaseItemDto } from './dto/create-return_purchase_item.dto';
import { UpdateReturnPurchaseItemDto } from './dto/update-return_purchase_item.dto';

@Injectable()
export class ReturnPurchaseItemService {
  constructor(
    @Inject('RETURN_PURCHASE_ITEM_REPOSITORY')
    private readonly returnPurchaseItemRepo: Repository<ReturnPurchaseItem>,
  ) {}

  /**
   * Creates a ReturnPurchaseItem (transaction-aware).
   * @param returnPurchaseItemDto - Item data
   * @param transactionalEntityManager - Optional transaction manager. If provided, all DB operations use it.
   */
  async create(
    returnPurchaseItemDto: CreateReturnPurchaseItemDto,
    transactionalEntityManager?: EntityManager,
  ): Promise<ReturnPurchaseItem> {
    // Nice Feature: use the transaction approach to ensure ATOMICITY
    // Any operation with the database will be done through the transactional manager

    const manager =
      transactionalEntityManager || this.returnPurchaseItemRepo.manager;

    // Validate purchase item id
    const purchaseItem = await manager.findOne(PurchaseItem, {
      where: { id: returnPurchaseItemDto.purchaseItemId },
      relations: ['purchaseEntity'],
    });
    if (!purchaseItem) {
      throw new NotFoundException(
        `Purchase item with id ${returnPurchaseItemDto.purchaseItemId} not found`,
      );
    }

    // Validate the number of returned
    if (returnPurchaseItemDto.numberOfReturned > purchaseItem.numberOfItems) {
      throw new ConflictException(
        `Cannot return more items than available. Available: ${purchaseItem.numberOfItems}, Attempted: ${returnPurchaseItemDto.numberOfReturned}`,
      );
    }
    // Valid? => Update the number of items in the purchase item
    purchaseItem.numberOfItems -= returnPurchaseItemDto.numberOfReturned;
    await manager.save(PurchaseItem, purchaseItem);

    // Calculate the returned money
    const returnedMoney =
      purchaseItem.purchaseEntity.unitPrice *
      returnPurchaseItemDto.numberOfReturned;

    // Create, save, and return
    const returnPurchaseItem = manager.create(
      ReturnPurchaseItem,
      returnPurchaseItemDto,
    );
    returnPurchaseItem.returnedMoney = returnedMoney;
    return await manager.save(ReturnPurchaseItem, returnPurchaseItem);
  }

  async findAll(): Promise<ReturnPurchaseItem[]> {
    return await this.returnPurchaseItemRepo.find();
  }

  async findOne(id: number): Promise<ReturnPurchaseItem> {
    const returnPurchaseItem = await this.returnPurchaseItemRepo.findOne({
      where: { id },
    });
    if (!returnPurchaseItem) {
      throw new NotFoundException(
        `Return purchase item with id ${id} not found`,
      );
    }
    return returnPurchaseItem;
  }

  async update(
    id: number,
    updateReturnPurchaseItemDto: UpdateReturnPurchaseItemDto,
    transactionalEntityManager?: EntityManager,
  ): Promise<ReturnPurchaseItem> {
    // Use provided transaction manager or fall back to default repo manager
    const manager =
      transactionalEntityManager || this.returnPurchaseItemRepo.manager;

    // 1. Validate return item exists
    const returnPurchaseItem = await manager.findOne(ReturnPurchaseItem, {
      where: { id },
    });
    if (!returnPurchaseItem) {
      throw new NotFoundException(
        `Return purchase item with id ${id} not found`,
      );
    }

    // 2. Validate new return quantity
    const purchaseItem = await manager.findOne(PurchaseItem, {
      where: { id: returnPurchaseItem.purchaseItemId },
    });
    if (!purchaseItem) {
      throw new NotFoundException(
        `Purchase item with id ${returnPurchaseItem.purchaseItemId} not found`,
      );
    }

    const difference =
      updateReturnPurchaseItemDto.numberOfReturned -
      returnPurchaseItem.numberOfReturned;

    if (difference > purchaseItem.numberOfItems) {
      throw new ConflictException(
        `Cannot return more items than available. Available: ${purchaseItem.numberOfItems}, Attempted: ${difference}`,
      );
    }

    // 3. Update purchase item stock
    purchaseItem.numberOfItems -= difference;
    await manager.save(PurchaseItem, purchaseItem);

    // 4. Update return item
    returnPurchaseItem.numberOfReturned =
      updateReturnPurchaseItemDto.numberOfReturned;
    return await manager.save(ReturnPurchaseItem, returnPurchaseItem);
  }

  /**
   * Soft deletes a return purchase item and restocks the original purchase item.
   * @param id - ID of the return purchase item to remove
   * @param transactionalEntityManager - Optional transaction manager to join an existing transaction
   * @returns The deleted return purchase item
   * @throws NotFoundException if the return item or associated purchase item doesn't exist
   */
  async remove(
    id: number,
    transactionalEntityManager?: EntityManager,
  ): Promise<ReturnPurchaseItem> {
    const manager =
      transactionalEntityManager || this.returnPurchaseItemRepo.manager;

    // Validate return item exists
    const returnPurchaseItem = await manager.findOne(ReturnPurchaseItem, {
      where: { id },
    });
    if (!returnPurchaseItem) {
      throw new NotFoundException(
        `Return purchase item with id ${id} not found`,
      );
    }

    // Validate purchase item exists and update it
    const purchaseItem = await manager.findOne(PurchaseItem, {
      where: { id: returnPurchaseItem.purchaseItemId },
    });
    if (!purchaseItem) {
      throw new NotFoundException(
        `Purchase item with id ${returnPurchaseItem.purchaseItemId} not found`,
      );
    }
    purchaseItem.numberOfItems += returnPurchaseItem.numberOfReturned;
    await manager.save(PurchaseItem, purchaseItem);

    // The core: delete and return
    await manager.softDelete(ReturnPurchaseItem, returnPurchaseItem.id);
    return returnPurchaseItem;
  }
}
