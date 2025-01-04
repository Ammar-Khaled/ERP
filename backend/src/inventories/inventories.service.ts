import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Address } from '../common/entities/address.entity';
import * as jsend from 'jsend';

@Injectable()
export class InventoriesService {
  constructor(
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto) {
    // TODO: Fix bug in one of the save functions
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

    // create the address
    const address = this.addressRepository.create(createInventoryDto.address);
    await this.addressRepository.save(address);

    // create the inventory
    const inventory = this.inventoryRepository.create({
      ...createInventoryDto,
      branch,
    });
    await this.inventoryRepository.save(inventory);
    return jsend.success(inventory);
  }

  findAll() {
    return `This action returns all inventories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }
}
