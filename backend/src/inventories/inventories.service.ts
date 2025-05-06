import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Branch } from '../branches/entities/branch.entity';

@Injectable()
export class InventoriesService {
  constructor(
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
  ) {}

  async findAll() {
    return await this.inventoryRepository.find();
  }

  async findOne(id: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['productItemInventories'],
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found with id: ' + id);
    }

    return inventory;
  }

  async create(createInventoryDto: CreateInventoryDto) {
    const inventory = this.inventoryRepository.create(createInventoryDto);
    await this.inventoryRepository.save(inventory);
    delete inventory.address;
    return inventory;
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
    // TODO: check if the inventory is used in any other entities like product items
  }
}
