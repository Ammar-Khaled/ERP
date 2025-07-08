import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreatePurchaseRequestDto } from './dto/create-purchase_request.dto';
import { config } from 'dotenv';
import { PurchaseRequest } from './entities/purchase_request.entity';
import { User } from 'src/users/entities/user.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { Supplier } from 'src/suppliers/entities/supplier.entity';
import { Status } from 'src/status/entities/status.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { CreatePurchaseItemDto } from 'src/purchase_request/dto/create-purchase_item.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase_request.dto';
import { UpdatePurchaseItemDto } from './dto/update-purchase_item.dto';
import { PurchaseItem } from './entities/purchase_item.entity';
import { PurchaseEntity } from '../purchase_entity/entities/purchase_entity.entity';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { Inventory } from 'src/inventories/entities/inventory.entity';
import { PurchaseInventoryService } from 'src/purchase_inventory/purchase_inventory.service';
import { BaseService } from '../common/services/base.service';

config();

@Injectable()
export class PurchaseRequestService extends BaseService<PurchaseRequest> {
  constructor(
    @Inject('PURCHASE_REQUEST_REPOSITORY')
    private purchaseRequestRepository: Repository<PurchaseRequest>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
    @Inject('SUPPLIER_REPOSITORY')
    private supplierRepository: Repository<Supplier>,
    @Inject('STATUS_REPOSITORY')
    private statusRepository: Repository<Status>,
    @Inject('CURRENCY_REPOSITORY')
    private currencyRepository: Repository<Currency>,
    @Inject('PURCHASE_ITEM_REPOSITORY')
    private purchaseItemRepository: Repository<PurchaseItem>,
    @Inject('PURCHASE_ENTITY_REPOSITORY')
    private purchaseEntityRepository: Repository<PurchaseEntity>,
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
    private purchaseInventoryService: PurchaseInventoryService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(purchaseRequestRepository);
  }

  async createPurchaseItem(createPurchaseItemDto: CreatePurchaseItemDto) {
    const existedEntity = await this.purchaseEntityRepository.findOne({
      where: { name: createPurchaseItemDto.purchaseEntityName },
    });
    if (!existedEntity) {
      throw new NotFoundException(
        `There is no purchase entity with name "${createPurchaseItemDto.purchaseEntityName}". Please create it first!`,
      );
    }

    const newPurchaseItem = new PurchaseItem();
    newPurchaseItem.purchaseEntity = existedEntity;
    newPurchaseItem.numberOfItems = createPurchaseItemDto.numberOfItems;
    newPurchaseItem.discount = createPurchaseItemDto.discount;
    // newPurchaseItem.purchaseEntityId = purchaseEntityId;

    return await this.purchaseItemRepository.save(newPurchaseItem);
  }

  // async updateItem(id: number, updatePurchaseItemDto: UpdatePurchaseItemDto) {
  //   const purchaseItem = await this.purchaseItemRepository.findOne({
  //     where: { id },
  //     relations: ['purchaseRequest', 'purchaseEntity'],
  //   });
  //
  //   if (!purchaseItem) {
  //     throw new NotFoundException(`Purchase item with ID ${id} not found`);
  //   }
  //
  //   // Store old total price for calculating difference
  //   // const oldTotalPrice = purchaseItem.totalPrice;
  //
  //   // Update purchase item properties
  //   Object.assign(purchaseItem, updatePurchaseItemDto);
  //
  //   // Recalculate total price (will trigger the hook, but only for itself)
  //   // purchaseItem.totalPrice =
  //   //   purchaseItem.numberOfItems * purchaseItem.purchaseEntity.unitPrice -
  //   //   purchaseItem.discount;
  //
  //   // Calculate difference
  //   // const priceDifference = purchaseItem.totalPrice - oldTotalPrice;
  //
  //   // Update parent purchase request
  //   if (priceDifference !== 0) {
  //     purchaseItem.purchaseRequest.totalPrice += priceDifference;
  //     purchaseItem.purchaseRequest.totalPrice = Math.max(
  //       0,
  //       purchaseItem.purchaseRequest.totalPrice,
  //     );
  //
  //     // Save both entities in a transaction
  //     const queryRunner = this.dataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();
  //
  //     try {
  //       await queryRunner.manager.save(purchaseItem);
  //       await queryRunner.manager.save(purchaseItem.purchaseRequest);
  //       await queryRunner.commitTransaction();
  //
  //       return purchaseItem;
  //     } catch (error) {
  //       await queryRunner.rollbackTransaction();
  //       throw new HttpException(
  //         error.message,
  //         HttpStatus.INTERNAL_SERVER_ERROR,
  //       );
  //     } finally {
  //       await queryRunner.release();
  //     }
  //   }
  //
  //   // If no purchase request or no price change, just save the item
  //   return await this.purchaseItemRepository.save(purchaseItem);
  // }

  async removeItem(id: number) {
    const purchaseItem = await this.purchaseItemRepository.findOneBy({ id });
    if (!purchaseItem)
      throw new NotFoundException(
        `There is no purchase item with id of ${id}!`,
      );

    await this.purchaseItemRepository.softDelete({ id });

    // trigger the hook to update the purchase request total price
    await this.purchaseRequestRepository.save(purchaseItem.purchaseRequest);

    return purchaseItem;
  }

  async create(
    createPurchaseRequestDto: CreatePurchaseRequestDto,
    userBranchId: number,
  ) {
    if (userBranchId !== createPurchaseRequestDto.branchId) {
      throw new ConflictException(
        'Can not create a purchase request outside your branch',
      );
    }

    const newPurchaseRequest = new PurchaseRequest();
    newPurchaseRequest.date = createPurchaseRequestDto.date;

    // Handle the inventory
    const inventory = await this.inventoryRepository.findOneBy({
      id: createPurchaseRequestDto.inventoryId,
    });
    if (!inventory) {
      throw new NotFoundException({
        message: `This inventory is not found!`,
      });
    }
    newPurchaseRequest.inventory = inventory;

    // Handle the user
    const user = await this.userRepository.findOneBy({
      id: createPurchaseRequestDto.userId,
    });
    if (!user) {
      throw new NotFoundException({ message: `This user is not found!` });
    }
    newPurchaseRequest.user = user;

    // Handle the branch
    const branch = await this.branchRepository.findOneBy({
      id: createPurchaseRequestDto.branchId,
    });
    if (!branch) {
      throw new NotFoundException({
        message: `This branch is not found!`,
      });
    }
    newPurchaseRequest.branch = branch;

    // Handle the supplier
    const supplier = await this.supplierRepository.findOneBy({
      id: createPurchaseRequestDto.supplierId,
    });
    if (!supplier) {
      throw new NotFoundException({
        message: `This supplier is not found!`,
      });
    }
    newPurchaseRequest.supplier = supplier;

    // Handle the status
    newPurchaseRequest.status = await this.statusRepository.findOneBy({
      name: 'purchase_request_pending',
    });

    // Handle the currency
    const currency = await this.currencyRepository.findOneBy({
      id: createPurchaseRequestDto.currencyId,
    });
    if (!currency) {
      throw new NotFoundException({
        message: `This currency is not found!`,
      });
    }
    newPurchaseRequest.currency = currency;

    // Handle the array of purchase items
    // Ensuring the items are unique based on the name of the purchase entity in the final result
    // by incrementing the quantity if found duplicated items
    const purchaseItemsDtos = createPurchaseRequestDto.purchaseItemsDtos;
    const uniquePurchaseItemsDtos = purchaseItemsDtos.reduce(
      (visited, item) => {
        const existingItem = visited.find(
          (i) => i.purchaseEntityName === item.purchaseEntityName,
        );
        if (existingItem) existingItem.numberOfItems += item.numberOfItems;
        else visited.push(item);

        return visited;
      },
      [] as CreatePurchaseItemDto[],
    );

    // link between purchase item and purchase request
    const purchaseItems = [];
    for (const itemDto of uniquePurchaseItemsDtos) {
      try {
        const purchaseItem = await this.createPurchaseItem(itemDto);
        purchaseItems.push(purchaseItem);
      } catch (error) {
        throw new HttpException(error.message, error.status || 500);
      }
    }
    newPurchaseRequest.purchaseItems = purchaseItems;

    // Save and log
    const savedPurchaseRequest =
      await this.purchaseRequestRepository.save(newPurchaseRequest);

    // Find users with the PurchaseRequestsController:review permission
    const reviewers = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .innerJoin('role.permissions', 'permission')
      .where('permission.name = :permissionName', {
        permissionName: 'PurchaseRequestsController:review',
      })
      .getMany();

    for (const reviewer of reviewers) {
      await this.notificationsService.create({
        title: 'New Purchase Request',
        message: `A new purchase request has been created by ${user.username}. Please review it.`,
        type: NotificationType.PURCHASE_REQUEST_REJECTED,
        userId: reviewer.id,
        relatedEntityId: savedPurchaseRequest.id,
        relatedEntityType: 'purchase_request',
      });
    }

    return this.findOneWithRelations(
      savedPurchaseRequest.id,
      userBranchId,
      false,
    );
  }

  async review(
    purchaseRequestId: number,
    reviewerId: number,
    reviewNotes: string,
    approved: boolean,
  ) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id: purchaseRequestId },
      relations: ['status', 'purchaseItems'],
    });
    if (!purchaseRequest) {
      throw new NotFoundException(
        `No purchase request with ID of (${purchaseRequestId})!`,
      );
    }

    const reviewer = await this.userRepository.findOneBy({
      id: reviewerId,
    });
    if (!reviewer) {
      throw new NotFoundException(`Reviewer with ID ${reviewerId} not found!`);
    }

    if (purchaseRequest.status.name !== 'purchase_request_pending') {
      throw new ConflictException('This request has already been processed');
    }

    // update the status
    if (approved) {
      const approvedStatus = await this.statusRepository.findOneBy({
        name: 'purchase_request_approved',
      });
      if (!approvedStatus) {
        throw new NotFoundException({
          message: `purchase_request_approved status is not found!`,
        });
      }
      purchaseRequest.status = approvedStatus;
    } else {
      const rejectedStatus = await this.statusRepository.findOneBy({
        name: 'purchase_request_rejected',
      });
      if (!rejectedStatus) {
        throw new NotFoundException({
          message: `purchase_request_rejected status is not found!`,
        });
      }
      purchaseRequest.status = rejectedStatus;
    }

    purchaseRequest.reviewer = reviewer;
    purchaseRequest.reviewNotes = reviewNotes;
    await this.purchaseRequestRepository.save(purchaseRequest);
    return purchaseRequest;
  }

  async findAll(
    paginationDto: PaginationDto,
    userBranchId: number,
  ): Promise<PaginatedResult<PurchaseRequest>> {
    return super.findAll(paginationDto, userBranchId);
  }

  async findOneWithRelations(
    id: number,
    userBranchId: number,
    withRelations: boolean = false,
  ) {
    const purchaseRelations = ['purchaseItems'];

    if (withRelations) {
      // Used in: generatePdf method
      purchaseRelations.push(
        'user',
        'branch',
        'supplier',
        'status',
        'currency',
      );
    }

    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id, branchId: userBranchId },
      relations: purchaseRelations,
    });

    if (!purchaseRequest)
      throw new NotFoundException(
        `No purchase request with ID of (${id}) in your branch!`,
      );

    return purchaseRequest;
  }

  async findOne(id: number, userBranchId: number) {
    return super.findOne(id, userBranchId);
  }

  async update(id: number, updatePurchaseRequestDto: UpdatePurchaseRequestDto) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id },
      relations: ['purchaseItems'],
      loadEagerRelations: true,
    });

    if (!purchaseRequest) {
      throw new NotFoundException(`No purchase request with ID of (${id})!`);
    }

    // Update related entities if necessary
    if (updatePurchaseRequestDto.inventoryId) {
      const inventory = await this.inventoryRepository.findOneBy({
        id: updatePurchaseRequestDto.inventoryId,
      });
      if (!inventory)
        throw new NotFoundException({
          message: `This inventory is not found!`,
        });
      purchaseRequest.inventory = inventory;
    }

    if (updatePurchaseRequestDto.userId) {
      const user = await this.userRepository.findOneBy({
        id: updatePurchaseRequestDto.userId,
      });
      if (!user) throw new NotFoundException(`This username is not found!`);
      purchaseRequest.user = user;
    }

    if (updatePurchaseRequestDto.supplierId) {
      const supplier = await this.supplierRepository.findOneBy({
        id: updatePurchaseRequestDto.supplierId,
      });
      if (!supplier)
        throw new NotFoundException({
          message: `This supplier name is not found!`,
        });
      purchaseRequest.supplier = supplier;
    }

    if (updatePurchaseRequestDto.currencyId) {
      const currency = await this.currencyRepository.findOneBy({
        id: updatePurchaseRequestDto.currencyId,
      });
      if (!currency)
        throw new NotFoundException({
          message: `This currency name is not found!`,
        });
      purchaseRequest.currency = currency;
    }

    if (updatePurchaseRequestDto.purchaseItemsDtos) {
      const uniqueUpdatePurchaseItemsDtos =
        updatePurchaseRequestDto.purchaseItemsDtos.reduce(
          (visited: UpdatePurchaseItemDto[], item) => {
            const existingItem = visited.find(
              (i) => i.purchaseEntityName === item.purchaseEntityName,
            );
            if (existingItem) existingItem.numberOfItems += item.numberOfItems;
            else visited.push(item);

            return visited;
          },
          [] as UpdatePurchaseItemDto[],
        );

      // delete the purchase items that are not in the new request
      const purchaseItemsToDelete = purchaseRequest.purchaseItems.filter(
        (item) =>
          !uniqueUpdatePurchaseItemsDtos.some(
            (dto) => dto.purchaseEntityName === item.purchaseEntity.name,
          ),
      );
      for (const item of purchaseItemsToDelete) {
        await this.purchaseItemRepository.softDelete({ id: item.id });
      }

      for (const itemDto of uniqueUpdatePurchaseItemsDtos) {
        // Check if the purchase item exists in this request
        const purchaseItem = purchaseRequest.purchaseItems.find(
          (item) => item.purchaseEntity.name === itemDto.purchaseEntityName,
        );

        if (!purchaseItem) {
          // create a new purchase item
          const newPurchaseItem = await this.createPurchaseItem({
            purchaseEntityName: itemDto.purchaseEntityName,
            numberOfItems: itemDto.numberOfItems || 0,
            discount: itemDto.discount || 0,
          });

          purchaseRequest.purchaseItems.push(newPurchaseItem);
        } else {
          // update the existing purchase item
          Object.assign(purchaseItem, itemDto);
          // save
          await this.purchaseItemRepository.save(purchaseItem);
        }
      }
      delete updatePurchaseRequestDto.purchaseItemsDtos;
    }

    Object.assign(purchaseRequest, updatePurchaseRequestDto);

    purchaseRequest.totalPrice = purchaseRequest.purchaseItems.reduce(
      (total, item) => total + item.totalPrice,
      0,
    );
    await this.purchaseRequestRepository.save(purchaseRequest);

    return purchaseRequest;
  }

  async remove(id: number, userBranchId: number) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id, branchId: userBranchId },
      relations: ['purchaseItems'],
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `No purchase request with ID of (${id}) in your branch!`,
      );
    }

    // remove all purchase items associated with this request
    for (const item of purchaseRequest.purchaseItems) {
      await this.removeItem(item.id);
    }

    await this.purchaseRequestRepository.softDelete({ id });
    return purchaseRequest;
  }

  async cancelRequest(id: number, userBranchId: number) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id, branchId: userBranchId },
      relations: ['status'],
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `No purchase request with ID of (${id}) in your branch!`,
      );
    }

    if (purchaseRequest.status.name !== 'purchase_request_pending') {
      throw new ConflictException(
        'This request cannot be cancelled as it is not pending.',
      );
    }

    purchaseRequest.status = await this.statusRepository.findOneBy({
      name: 'purchase_request_cancelled',
    });

    await this.purchaseRequestRepository.save(purchaseRequest);
    return purchaseRequest;
  }

  async addToInventory(id: number, userBranchId: number) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id, branchId: userBranchId },
      relations: ['status', 'purchaseItems', 'purchaseItems.purchaseEntity'],
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `No purchase request with ID of (${id}) in your branch!`,
      );
    }

    // verify the status is approved
    if (purchaseRequest.status.name !== 'purchase_request_approved') {
      throw new ConflictException(
        'This request cannot be added to inventory as it is not approved.',
      );
    }

    // Create purchase inventory records for each item in the request
    for (const item of purchaseRequest.purchaseItems) {
      await this.purchaseInventoryService.create({
        purchaseEntityId: item.purchaseEntity.id,
        inventoryId: purchaseRequest.inventoryId,
        amount: item.numberOfItems,
      });
    }

    // Update the purchase request status to 'purchase_request_completed'
    purchaseRequest.status = await this.statusRepository.findOneBy({
      name: 'purchase_request_completed',
    });

    return await this.purchaseRequestRepository.save(purchaseRequest);
  }
}
