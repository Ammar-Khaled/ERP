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
    // remove the address from the inventory dto
    delete createInventoryDto.address;

    // create the inventory
    const inventory = this.inventoryRepository.create({
      ...createInventoryDto,
      address,
      branch,
    });
    await this.inventoryRepository.save(inventory);
    return jsend.success(inventory);
  }

  async findAll() {
    return await this.inventoryRepository.find();
  }

  async findOne(id: number) {
    return await this.inventoryRepository.findOneBy({ id });
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const inventory = await this.inventoryRepository.findOneBy({ id });
    if (!inventory) {
      throw new ConflictException(
        jsend.error('Inventory not found with id: ' + id),
      );
    }

    // TODO: update the address and branch
    // get the branch
    // const branch = await this.branchRepository.findOneBy({
    //   id: updateInventoryDto.branchId,
    // });
    // if (!branch) {
    //   throw new ConflictException(
    //     jsend.error('Branch not found with id: ' + updateInventoryDto.branchId),
    //   );
    // }

    await this.inventoryRepository.update({ id }, { ...updateInventoryDto });
    return jsend.success(await this.inventoryRepository.findOneBy({ id }));
  }

  async remove(id: number) {
    const inventory = await this.inventoryRepository.findOneBy({ id });
    await this.inventoryRepository.delete({ id });
    return jsend.success(inventory);
  }
}
