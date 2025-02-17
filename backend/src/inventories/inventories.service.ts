import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Address } from '../common/entities/address.entity';
import * as jsend from 'jsend';
import { success } from 'jsend';
import { ProductItemToInventory } from '../product_item_inventory/entities/product_item_inventory.entity';
import { TransferProductItemsDto } from './dto/transfer-product-items.dto';

@Injectable()
export class InventoriesService {
  constructor(
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
    @Inject('PRODUCT_ITEM_INVENTORY_REPOSITORY')
    private productItemInventoryRepository: Repository<ProductItemToInventory>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto) {
    if (
      await this.inventoryRepository.findOneBy({
        name: createInventoryDto.name,
      })
    ) {
      throw new ConflictException(jsend.error('Inventory name already exists'));
    }

    // get the branch
    const branch = await this.branchRepository.findOneBy({
      id: createInventoryDto.branchId,
    });
    if (!branch) {
      throw new ConflictException(
        jsend.error('Branch not found with id: ' + createInventoryDto.branchId),
      );
    }

    // create the inventory
    const inventory = this.inventoryRepository.create({
      ...createInventoryDto,
      branch,
    });
    await this.inventoryRepository.save(inventory);
    return jsend.success(inventory);
  }

  async findAll() {
    const inventories = await this.inventoryRepository.find({
      relations: ['branch', 'productItemToInventories'],
    });
    for (let i = 0; i < inventories.length; i++) {
      const piis = inventories[i].productItemToInventories;
      inventories[i].total_product_items = 0;
      inventories[i].total_damaged_items = 0;
      for (const pii of piis) {
        inventories[i].total_product_items += pii.number_of_items;
        inventories[i].total_damaged_items += pii.number_of_damaged;
      }
    }
    return success(inventories);
  }

  async findOne(id: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['branch'],
    });
    return jsend.success(inventory);
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const inventory = await this.inventoryRepository.findOneBy({ id });
    if (!inventory) {
      throw new ConflictException(
        jsend.error('Inventory not found with id: ' + id),
      );
    }

    // update the branch
    if (updateInventoryDto.branchId) {
      const branch = await this.branchRepository.findOneBy({
        id: updateInventoryDto.branchId,
      });
      if (!branch) {
        throw new ConflictException(
          jsend.error(
            'Branch not found with id: ' + updateInventoryDto.branchId,
          ),
        );
      }
      inventory.branch = branch;
      delete updateInventoryDto.branchId;
    }

    if (updateInventoryDto.address) {
      if (inventory.address?.id) {
        updateInventoryDto.address.id = inventory.address.id;
      }
    }

    Object.assign(inventory, updateInventoryDto);
    return await this.inventoryRepository.save(inventory);
  }

  async remove(id: number) {
    const inventory = await this.inventoryRepository.findOneBy({ id });
    if (!inventory) {
      throw new ConflictException(
        jsend.error('Inventory not found with id: ' + id),
      );
    }

    const addressId = inventory.address?.id;
    await this.inventoryRepository.remove(inventory);
    await this.addressRepository.delete({ id: addressId });
    return jsend.success(inventory);
  }

  async transferProductItems(transferProductItemsDto: TransferProductItemsDto) {
    // get the source inventory
    const sourceInventory = await this.inventoryRepository.findOneBy({
      id: transferProductItemsDto.sourceInventoryId,
    });
    if (!sourceInventory) {
      throw new ConflictException(
        jsend.error(
          'Source inventory not found with id: ' +
            transferProductItemsDto.sourceInventoryId,
        ),
      );
    }

    // get the target inventory
    const targetInventory = await this.inventoryRepository.findOneBy({
      id: transferProductItemsDto.targetInventoryId,
    });
    if (!targetInventory) {
      throw new ConflictException(
        jsend.error(
          'Target inventory not found with id: ' +
            transferProductItemsDto.targetInventoryId,
        ),
      );
    }

    // get the source product item inventory
    const sourceProductItemInventory =
      await this.productItemInventoryRepository.findOneBy({
        inventory_id: transferProductItemsDto.sourceInventoryId,
        product_item_id: transferProductItemsDto.productItemId,
      });

    if (!sourceProductItemInventory) {
      throw new ConflictException(
        jsend.error(
          'Product item not found with id: ' +
            transferProductItemsDto.productItemId +
            'in inventory with id: ' +
            transferProductItemsDto.sourceInventoryId,
        ),
      );
    }

    if (
      sourceProductItemInventory.number_of_items <
      transferProductItemsDto.quantity
    ) {
      throw new ConflictException(
        jsend.error('Not enough items in source inventory'),
      );
    }
    sourceProductItemInventory.number_of_items -=
      transferProductItemsDto.quantity;
    await this.productItemInventoryRepository.save(sourceProductItemInventory);

    // get the target product item inventory
    const targetProductItemInventory =
      await this.productItemInventoryRepository.findOneBy({
        inventory_id: transferProductItemsDto.targetInventoryId,
        product_item_id: transferProductItemsDto.productItemId,
      });

    if (targetProductItemInventory) {
      targetProductItemInventory.number_of_items +=
        transferProductItemsDto.quantity;
      return await this.productItemInventoryRepository.save(
        targetProductItemInventory,
      );
    } else {
      const newProductItemInventory =
        this.productItemInventoryRepository.create({
          inventory_id: transferProductItemsDto.targetInventoryId,
          product_item_id: transferProductItemsDto.productItemId,
          number_of_items: transferProductItemsDto.quantity,
          number_of_damaged: 0,
        });
      return await this.productItemInventoryRepository.save(
        newProductItemInventory,
      );
    }
  }
}
