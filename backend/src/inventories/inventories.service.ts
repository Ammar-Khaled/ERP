import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Branch } from '../branches/entities/branch.entity';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class InventoriesService
  extends BaseService<Inventory>
  implements OnModuleInit
{
  constructor(
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
  ) {
    super(inventoryRepository);
  }

  async onModuleInit() {
    // await this.inventoryRepository.save({
    //   name: 'Main Inventory',
    //   nameAr: 'المخزن الرئيسي',
    //   description: 'Main inventory for the main branch',
    //   descriptionAr: 'المخزن الرئيسي للفرع الرئيسي',
    //   branchId: 1,
    // });
  }

  async findAll(
    paginationDto: PaginationDto,
    branchId: number,
  ): Promise<PaginatedResult> {
    return super.findAll(paginationDto, branchId);
  }

  async findOne(id: number, branchId: number, relations?: string[]) {
    return await super.findOne(id, branchId, relations);
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

    // // update the branch
    // if (updateInventoryDto.branchId) {
    //   const branch = await this.branchRepository.findOneBy({
    //     id: updateInventoryDto.branchId,
    //   });
    //   if (!branch) {
    //     throw new NotFoundException(
    //       'Branch not found with id: ' + updateInventoryDto.branchId,
    //     );
    //   }
    // }

    if (updateInventoryDto.address) {
      if (inventory.address?.id) {
        updateInventoryDto.address.id = inventory.address.id;
      }
    }

    Object.assign(inventory, updateInventoryDto);
    await this.inventoryRepository.save(inventory);
    return inventory;
  }

  async remove(id: number, branchId: number): Promise<Inventory> {
    const inventory = await this.findOne(id, branchId);

    if (
      inventory.totalNumberOfValid > 0 ||
      inventory.totalNumberOfDamaged > 0 ||
      inventory.totalNumberOfPurchaseEntities > 0
    ) {
      throw new ConflictException(
        'Inventory cannot be deleted because it contains stock.',
      );
    }

    return await this.inventoryRepository.softRemove(inventory);
    // TODO: check if the inventory is used in any other entities like product items
  }
}
