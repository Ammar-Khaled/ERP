import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReturnPurchaseDto } from './dto/create-return_purchase.dto';
import { UpdateReturnPurchaseDto } from './dto/update-return_purchase.dto';
import { ReturnPurchase } from './entities/return_purchase.entity';
import { ReturnPurchaseItemService } from './return_purchase_item.service';
import { Repository } from 'typeorm';
import { ReturnPurchaseItem } from './entities/return_purchase_item.entity';
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
  ) {}

  /////////////////Utility Methods////////////////////

  /**
   * Checks for duplicate purchaseItemId in an array of returnPurchaseItemDtos.
   * Returns true if all are unique, false if duplicates exist.
   */
  hasDuplicatePurchaseItemIds(
    returnPurchaseItemDtos: { purchaseItemId: number }[],
  ): boolean {
    const seen = new Set<number>();
    for (const dto of returnPurchaseItemDtos) {
      if (seen.has(dto.purchaseItemId)) {
        return true; // Duplicate found
      }
      seen.add(dto.purchaseItemId);
    }
    return false; // All unique
  }

  /**
   * Checks if all purchaseItemIds in returnPurchaseItemDtos exist in the given purchaseRequest's purchaseItems.
   * Returns true if all exist, false if any are missing.
   */
  areAllPurchaseItemIdsInRequest(
    returnPurchaseItemDtos: { purchaseItemId: number }[],
    purchaseRequest: PurchaseRequest,
  ): boolean {
    if (!purchaseRequest?.purchaseItems?.length) return false;
    const validIds = new Set(
      purchaseRequest.purchaseItems.map((item) => item.id),
    );
    return returnPurchaseItemDtos.every((dto) =>
      validIds.has(dto.purchaseItemId),
    );
  }

  /////////////////Service Methods////////////////////

  async create(createReturnPurchaseDto: CreateReturnPurchaseDto) {
    // Restrict the duplicate return items
    if (
      this.hasDuplicatePurchaseItemIds(
        createReturnPurchaseDto.returnPurchaseItemDtos,
      )
    ) {
      throw new ConflictException(
        'Conflict: Duplicate purchase item IDs found in return purchase items',
      );
    }

    // Use the transaction method to ensure atomicity
    return await this.returnPurchaseRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // Store the basic info
        const newReturnPurchase = transactionalEntityManager.create(
          ReturnPurchase,
          createReturnPurchaseDto,
        );

        // Check the existence of the purchase request
        const purchaseRequest = await transactionalEntityManager.findOne(
          PurchaseRequest,
          {
            where: { id: createReturnPurchaseDto.purchaseRequestId },
            relations: ['purchaseItems'],
          },
        );
        if (!purchaseRequest) {
          throw new NotFoundException(
            `Purchase Request with ID ${createReturnPurchaseDto.purchaseRequestId} not found`,
          );
        }

        if (
          !this.areAllPurchaseItemIdsInRequest(
            createReturnPurchaseDto.returnPurchaseItemDtos,
            purchaseRequest,
          )
        ) {
          throw new ConflictException(
            'Conflict: Some purchase item IDs do not exist in the specified purchase request',
          );
        }

        // Validate the status existence
        const status = await transactionalEntityManager.findOne(Status, {
          where: { id: createReturnPurchaseDto.statusId },
        });
        if (!status) {
          throw new NotFoundException(
            `Status with ID ${createReturnPurchaseDto.statusId} not found`,
          );
        }

        // Create the return purchase items and store them
        const returnPurchaseItems: ReturnPurchaseItem[] = [];
        try {
          for (const itemDto of createReturnPurchaseDto.returnPurchaseItemDtos) {
            // Use the service but pass the transactional manager if needed
            const returnPurchaseItem =
              await this.returnPurchaseItemService.create(
                itemDto,
                transactionalEntityManager,
              );
            returnPurchaseItems.push(returnPurchaseItem);
          }
        } catch (error) {
          throw new ConflictException(
            `Failed to create return purchase items: ${error.message}`,
          );
        }
        newReturnPurchase.returnPurchaseItems = returnPurchaseItems;

        // Save the new return purchase
        return await transactionalEntityManager.save(
          ReturnPurchase,
          newReturnPurchase,
        );
      },
    );
  }

  async findAll(): Promise<ReturnPurchase[]> {
    return this.returnPurchaseRepo.find();
  }

  async findOne(id: number): Promise<ReturnPurchase> {
    const returnPurchase = await this.returnPurchaseRepo.findOne({
      where: { id },
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
    // Restrict the duplicate return items
    if (
      this.hasDuplicatePurchaseItemIds(
        updateReturnPurchaseDto.returnPurchaseItemDtos,
      )
    ) {
      throw new ConflictException(
        'Conflict: Duplicate purchase item IDs found in return purchase items',
      );
    }

    return await this.returnPurchaseRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // Find the existing return purchase
        const existingReturnPurchase = await transactionalEntityManager.findOne(
          ReturnPurchase,
          {
            where: { id },
            relations: [
              'purchaseRequest',
              'purchaseRequest.purchaseItems',
              'returnPurchaseItems',
            ],
          },
        );
        if (!existingReturnPurchase) {
          throw new NotFoundException(
            `Return Purchase with ID ${id} not found`,
          );
        }

        if (
          !this.areAllPurchaseItemIdsInRequest(
            updateReturnPurchaseDto.returnPurchaseItemDtos,
            existingReturnPurchase.purchaseRequest,
          )
        ) {
          throw new ConflictException(
            'Conflict: Some purchase item IDs do not exist in the specified purchase request',
          );
        }

        // Update the return purchase items if exist and store them
        if (updateReturnPurchaseDto.returnPurchaseItemDtos) {
          const oldItems = existingReturnPurchase.returnPurchaseItems || [];
          const updatedItems: ReturnPurchaseItem[] = [];

          for (const itemDto of updateReturnPurchaseDto.returnPurchaseItemDtos) {
            try {
              const existingItem =
                existingReturnPurchase.returnPurchaseItems.find(
                  (item) => item.purchaseItemId === itemDto.purchaseItemId,
                );

              const result = existingItem
                ? await this.returnPurchaseItemService.update(
                    existingItem.id,
                    itemDto,
                    transactionalEntityManager,
                  )
                : await this.returnPurchaseItemService.create(
                    itemDto,
                    transactionalEntityManager,
                  );

              updatedItems.push(result);
            } catch (error) {
              // Transaction will auto-rollback when we rethrow
              throw new ConflictException(
                `Failed to process item ${itemDto.purchaseItemId}: ${error.message}`,
              );
            }
          }

          // Remove the items that are no longer in the updated items
          const itemsToRemove = oldItems.filter(
            (item) =>
              !updatedItems.some((updatedItem) => updatedItem.id === item.id),
          );
          for (const item of itemsToRemove) {
            await this.returnPurchaseItemService.remove(
              item.id,
              transactionalEntityManager,
            );
          }

          existingReturnPurchase.returnPurchaseItems = updatedItems;
        }

        // Validate the existence of the status
        if (updateReturnPurchaseDto.statusId) {
          // Notice: use `exists()` is faster than `findOne()` for existence checks
          const statusExists = await transactionalEntityManager.exists(Status, {
            where: { id: updateReturnPurchaseDto.statusId },
          });
          if (!statusExists) {
            throw new NotFoundException(
              `Status with ID ${updateReturnPurchaseDto.statusId} not found`,
            );
          }
        }

        // Store basic properties and return the result
        Object.assign(existingReturnPurchase, updateReturnPurchaseDto);
        return await transactionalEntityManager.save(
          ReturnPurchase,
          existingReturnPurchase,
        );
      },
    );
  }

  async remove(id: number) {
    return this.returnPurchaseRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // 1. Find the return purchase
        const returnPurchase = await transactionalEntityManager.findOne(
          ReturnPurchase,
          {
            where: { id },
            relations: ['returnPurchaseItems'],
          },
        );
        if (!returnPurchase) {
          throw new NotFoundException(
            `Return Purchase with ID ${id} not found`,
          );
        }

        // 2. Remove all associated items transactionally
        // Note: Use the sequential `for` instead of parallel `map + Promise.all` to ensure the transactional integrity
        if (returnPurchase.returnPurchaseItems?.length) {
          for (const item of returnPurchase.returnPurchaseItems) {
            await this.returnPurchaseItemService.remove(
              item.id,
              transactionalEntityManager,
            );
          }
        }

        // 3. Soft delete and return
        await transactionalEntityManager.softDelete(ReturnPurchase, { id });
        return returnPurchase;
      },
    );
  }
}
