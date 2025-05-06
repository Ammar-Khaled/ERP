import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Branch } from '../branches/entities/branch.entity';
import { ProductItemToInventory } from '../product_item_inventory/entities/product_item_inventory.entity';
import { TransferProductItemsDto } from './dto/transfer-product-items.dto';
import { ProductItem } from '../product_item/entities/product_item.entity';

@Injectable()
export class InventoriesService {
  constructor(
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
    @Inject('PRODUCT_ITEM_REPOSITORY')
    private productItemRepository: Repository<ProductItem>,
    @Inject('PRODUCT_ITEM_INVENTORY_REPOSITORY')
    private productItemInventoryRepository: Repository<ProductItemToInventory>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto) {
    const inventory = this.inventoryRepository.create(createInventoryDto);
    await this.inventoryRepository.save(inventory);
    delete inventory.address;
    return inventory;
  }

  async findAll() {
    const returnedInventories = [];

    const inventories = await this.inventoryRepository.find({
      relations: ['productItemToInventories'],
    });
    for (let i = 0; i < inventories.length; i++) {
      let numberOfValid = 0;
      let numberOfDamaged = 0;
      const piis = inventories[i].productItemToInventories;
      for (const pii of piis) {
        numberOfValid += pii.numberOfValid;
        numberOfDamaged += pii.numberOfDamaged;
      }
      returnedInventories.push({
        ...inventories[i],
        numberOfValid,
        numberOfDamaged,
      });
    }

    return returnedInventories;
  }

  async findOne(id: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['productItemToInventories'],
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found with id: ' + id);
    }

    let numberOfValid = 0;
    let numberOfDamaged = 0;
    for (const pii of inventory.productItemToInventories) {
      numberOfValid += pii.numberOfValid;
      numberOfDamaged += pii.numberOfDamaged;
    }

    return { ...inventory, numberOfValid, numberOfDamaged };
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const inventory = await this.inventoryRepository.findOneBy({ id });
    if (!inventory) {
      throw new NotFoundException('Inventory not found with id: ' + id);
    }

    // update the branch
    if (updateInventoryDto.branchId) {
      const branch = await this.branchRepository.findOneBy({
        id: updateInventoryDto.branchId,
      });
      if (!branch) {
        throw new NotFoundException(
          'Branch not found with id: ' + updateInventoryDto.branchId,
        );
      }
    }

    if (updateInventoryDto.address) {
      if (inventory.address?.id) {
        updateInventoryDto.address.id = inventory.address.id;
      }
    }

    Object.assign(inventory, updateInventoryDto);
    await this.inventoryRepository.save(inventory);
    return inventory;
  }

  async remove(id: number) {
    const inventory = await this.inventoryRepository.findOneBy({ id });
    if (!inventory) {
      throw new NotFoundException('Inventory not found with id: ' + id);
    }

    return await this.inventoryRepository.softRemove(inventory);
  }

  async transferProductItems(transferProductItemsDto: TransferProductItemsDto) {
    // get the source inventory
    const sourceInventory = await this.inventoryRepository.findOneBy({
      id: transferProductItemsDto.sourceInventoryId,
    });
    if (!sourceInventory) {
      throw new ConflictException(
        'Source inventory not found with id: ' +
          transferProductItemsDto.sourceInventoryId,
      );
    }

    // get the target inventory
    const targetInventory = await this.inventoryRepository.findOneBy({
      id: transferProductItemsDto.targetInventoryId,
    });
    if (!targetInventory) {
      throw new ConflictException(
        'Target inventory not found with id: ' +
          transferProductItemsDto.targetInventoryId,
      );
    }

    // validate the source and target inventories
    if (sourceInventory.id === targetInventory.id) {
      throw new ConflictException(
        'Source and target inventories cannot be the same',
      );
    }

    // validate the product item
    const productItem = await this.productItemRepository.findOneBy({
      id: transferProductItemsDto.productItemId,
    });
    if (!productItem) {
      throw new ConflictException(
        'Product item not found with id: ' +
          transferProductItemsDto.productItemId,
      );
    }

    // get the source product item inventory
    const sourceProductItemInventory =
      await this.productItemInventoryRepository.findOneBy({
        inventoryId: transferProductItemsDto.sourceInventoryId,
        productItemId: transferProductItemsDto.productItemId,
      });

    if (!sourceProductItemInventory) {
      throw new ConflictException(
        'Product item not found with id: ' +
          transferProductItemsDto.productItemId +
          'in inventory with id: ' +
          transferProductItemsDto.sourceInventoryId,
      );
    }

    if (
      sourceProductItemInventory.numberOfValid <
        transferProductItemsDto.numberOfValid ||
      sourceProductItemInventory.numberOfDamaged <
        transferProductItemsDto.numberOfDamaged
    ) {
      throw new ConflictException('Not enough items in source inventory');
    }
    sourceProductItemInventory.numberOfValid -=
      transferProductItemsDto.numberOfValid;
    sourceProductItemInventory.numberOfDamaged -=
      transferProductItemsDto.numberOfDamaged;
    await this.productItemInventoryRepository.save(sourceProductItemInventory);

    // get the target product item inventory
    const targetProductItemInventory =
      await this.productItemInventoryRepository.findOneBy({
        inventoryId: transferProductItemsDto.targetInventoryId,
        productItemId: transferProductItemsDto.productItemId,
      });

    if (targetProductItemInventory) {
      targetProductItemInventory.numberOfValid +=
        transferProductItemsDto.numberOfValid;
      targetProductItemInventory.numberOfDamaged +=
        transferProductItemsDto.numberOfDamaged;
      return await this.productItemInventoryRepository.save(
        targetProductItemInventory,
      );
    } else {
      const newProductItemInventory =
        this.productItemInventoryRepository.create({
          inventoryId: transferProductItemsDto.targetInventoryId,
          productItemId: transferProductItemsDto.productItemId,
          numberOfValid: transferProductItemsDto.numberOfValid,
          numberOfDamaged: transferProductItemsDto.numberOfDamaged,
        });
      return await this.productItemInventoryRepository.save(
        newProductItemInventory,
      );
    }
  }
}
