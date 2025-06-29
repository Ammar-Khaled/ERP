import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReturnPurchaseDto } from './dto/create-return_purchase.dto';
import { UpdateReturnPurchaseDto } from './dto/update-return_purchase.dto';
import { ReturnPurchase } from './entities/return_purchase.entity';
import { ReturnPurchaseItemService } from './return_purchase_item.service';
import { PurchaseRequestService } from 'src/purchase_request/purchase_request.service';
import { EntityManager, Repository } from 'typeorm';
import { ReturnPurchaseItem } from './entities/return_purchase_item.entity';
import { StatusService } from 'src/status/status.service';
import { Status } from 'src/status/entities/status.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';

@Injectable()
export class ReturnPurchaseService {
  constructor(
    @Inject('RETURN_PURCHASE_REPOSITORY')
    private readonly returnPurchaseRepo: Repository<ReturnPurchase>,
    private readonly returnPurchaseItemService: ReturnPurchaseItemService,
    @Inject('PURCHASE_REQUEST_REPOSITORY')
    private readonly purchaseRequestRepo: Repository<PurchaseRequest>,
    @Inject('STATUS_REPOSITORY')
    private readonly statusRepo: Repository<Status>,
  ) { }
  async create(createReturnPurchaseDto: CreateReturnPurchaseDto) {
    // Use the transaction method to ensure atomicity
    return await this.returnPurchaseRepo.manager.transaction(async (transactionalEntityManager) => {
      // Store the basic info
      const newReturnPurchase = transactionalEntityManager.create(ReturnPurchase, createReturnPurchaseDto);

      // Check the existence of the purchase request
      const purchaseRequest = await transactionalEntityManager.findOne(PurchaseRequest, {
        where: { id: createReturnPurchaseDto.purchaseRequestId },
      });
      if (!purchaseRequest) {
        throw new NotFoundException(`Purchase Request with ID ${createReturnPurchaseDto.purchaseRequestId} not found`);
      }

      // Validate the status existence
      const status = await transactionalEntityManager.findOne(Status, {
        where: { id: createReturnPurchaseDto.statusId },
      });
      if (!status) {
        throw new NotFoundException(`Status with ID ${createReturnPurchaseDto.statusId} not found`);
      }

      // Create the return purchase items and store them
      const returnPurchaseItems: ReturnPurchaseItem[] = [];
      try {
        for (const itemDto of createReturnPurchaseDto.returnPurchaseItemDtos) {
          // Use the service but pass the transactional manager if needed
          const returnPurchaseItem = await this.returnPurchaseItemService.create(itemDto, transactionalEntityManager);
          returnPurchaseItems.push(returnPurchaseItem);
        }
      } catch (error) {
        throw new Error(`Failed to create return purchase items: ${error.message}`);
      }
      newReturnPurchase.returnPurchaseItems = returnPurchaseItems;

      // Save the new return purchase
      return await transactionalEntityManager.save(ReturnPurchase, newReturnPurchase);
    });
  }

  async findAll(): Promise<ReturnPurchase[]> {
    return this.returnPurchaseRepo.find({
      relations: ['returnPurchaseItems'],
    });
  }

  async findOne(id: number): Promise<ReturnPurchase> {
    const returnPurchase = await this.returnPurchaseRepo.findOne({
      where: { id },
      relations: ['returnPurchaseItems'],
    });
    if (!returnPurchase) {
      throw new NotFoundException(`Return Purchase with ID ${id} not found`);
    }
    return returnPurchase;
  }

  /**
   * Updates a return purchase by its id as one transaction.
   * @param id - ID of the return purchase to update
   * @param updateReturnPurchaseDto - Data to update the return purchase
   * @returns The updated return purchase
   */
  async update(
    id: number,
    updateReturnPurchaseDto: UpdateReturnPurchaseDto,
  ): Promise<ReturnPurchase> {
    return await this.returnPurchaseRepo.manager.transaction(async (transactionalEntityManager) => {
      // Find the existing return purchase
      const existingReturnPurchase = await transactionalEntityManager.findOne(ReturnPurchase, {
        where: { id },
      });
      if (!existingReturnPurchase) {
        throw new NotFoundException(`Return Purchase with ID ${id} not found`);
      }

      // Update the return purchase items if exist and store them
      if (updateReturnPurchaseDto.returnPurchaseItemDtos) {
        const itemUpdates = updateReturnPurchaseDto.returnPurchaseItemDtos.map(async itemDto => {
          // Does the item already exist?
          const existingItem = existingReturnPurchase.returnPurchaseItems.find(
            item => item.id === itemDto.purchaseItemId,
          );

          // Update if found. Create if not.
          return existingItem
            ? this.returnPurchaseItemService.update(existingItem.id, itemDto, transactionalEntityManager)
            : this.returnPurchaseItemService.create(itemDto, transactionalEntityManager);
        });

        existingReturnPurchase.returnPurchaseItems = await Promise.all(itemUpdates);
      }

      // Validate the existence of the status
      if (updateReturnPurchaseDto.statusId) {
        // Notice: use `exists()` is faster than `findOne()` for existence checks
        const statusExists = await transactionalEntityManager.exists(Status, {
          where: { id: updateReturnPurchaseDto.statusId },
        });
        if (!statusExists) {
          throw new NotFoundException(`Status with ID ${updateReturnPurchaseDto.statusId} not found`);
        }
      }

      // Store basic properties and return the result
      Object.assign(existingReturnPurchase, updateReturnPurchaseDto);
      return await transactionalEntityManager.save(ReturnPurchase, existingReturnPurchase);
    });
  }

  async remove(id: number) {
    return this.returnPurchaseRepo.manager.transaction(async (transactionalEntityManager) => {
      // 1. Find the return purchase
      const returnPurchase = await transactionalEntityManager.findOne(ReturnPurchase, {
        where: { id },
      });
      if (!returnPurchase) {
        throw new NotFoundException(`Return Purchase with ID ${id} not found`);
      }

      // 2. Remove all associated items transactionally
      if (returnPurchase.returnPurchaseItems?.length) {
        await Promise.all(
          returnPurchase.returnPurchaseItems.map(
            item => this.returnPurchaseItemService.remove(item.id, transactionalEntityManager)
          )
        );
      }

      // 3. Soft delete and return
      await transactionalEntityManager.softDelete(ReturnPurchase, { id });
      return returnPurchase;
    })
  }
}
