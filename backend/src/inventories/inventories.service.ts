import {
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

@Injectable()
export class InventoriesService implements OnModuleInit {
  constructor(
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
  ) {}

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
  ): Promise<PaginatedResult<Inventory>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.inventoryRepository.findAndCount({
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['productItemToInventories'],
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
