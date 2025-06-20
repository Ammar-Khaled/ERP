import {
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

config();

@Injectable()
export class PurchaseRequestService {
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
  ) {}

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
    // newPurchaseItem.purchaseRequestId = purchaseRequestId;

    return await this.purchaseItemRepository.save(newPurchaseItem);
  }

  async findItem(id: number) {
    const item = await this.purchaseItemRepository.findOneBy({ id });
    if (!item)
      throw new NotFoundException(
        `There is no purchase item with id of ${id}!`,
      );
    return item;
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

  async create(createPurchaseRequestDto: CreatePurchaseRequestDto) {
    const newPurchaseRequest = new PurchaseRequest();
    newPurchaseRequest.date = createPurchaseRequestDto.date;

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
    const status = await this.statusRepository.findOneBy({
      id: createPurchaseRequestDto.statusId,
    });
    if (!status) {
      throw new NotFoundException({
        message: `This status is not found!`,
      });
    }
    newPurchaseRequest.status = status;

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

    return this.findOne(savedPurchaseRequest.id, false);
  }

  async findAll() {
    return await this.purchaseRequestRepository.find();
  }

  async findOne(id: number, withRelations: boolean = false) {
    let purchaseRequest;
    if (withRelations) {
      // Used in: generatePdf method
      purchaseRequest = await this.purchaseRequestRepository.findOne({
        where: { id },
        relations: [
          'user',
          'branch',
          'supplier',
          'status',
          'currency',
          'purchaseItems',
        ],
      });
    } else {
      purchaseRequest = await this.purchaseRequestRepository.findOneBy({
        id,
      });
    }

    if (!purchaseRequest)
      throw new NotFoundException(`No purchase request with ID of (${id})!`);

    return purchaseRequest;
  }

  async update(id: number, updatePurchaseRequestDto: UpdatePurchaseRequestDto) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id },
      relations: ['purchaseItems'],
    });

    if (!purchaseRequest) {
      throw new NotFoundException(`No purchase request with ID of (${id})!`);
    }

    // Update related entities if necessary
    if (updatePurchaseRequestDto.userId) {
      const user = await this.userRepository.findOneBy({
        id: updatePurchaseRequestDto.userId,
      });
      if (!user) throw new NotFoundException(`This username is not found!`);
      purchaseRequest.user = user;
    }

    if (updatePurchaseRequestDto.branchId) {
      const branch = await this.branchRepository.findOneBy({
        id: updatePurchaseRequestDto.branchId,
      });
      if (!branch)
        throw new NotFoundException({
          message: `This branch name is not found!`,
        });
      purchaseRequest.branch = branch;
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

    if (updatePurchaseRequestDto.statusId) {
      const status = await this.statusRepository.findOneBy({
        id: updatePurchaseRequestDto.statusId,
      });
      if (!status)
        throw new NotFoundException({
          message: `This status name is not found!`,
        });
      purchaseRequest.status = status;
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
    await this.purchaseRequestRepository.save(purchaseRequest);

    return this.findOne(purchaseRequest.id, false);
    // TODO what about deleteing items when updating the invoice?
  }

  async remove(id: number) {
    const purchaseRequest = await this.findOne(id);
    await this.purchaseRequestRepository.softDelete({ id });

    console.log(`Removed purchase request with ID: ${id} successfully!`);
    return purchaseRequest;
  }
}
