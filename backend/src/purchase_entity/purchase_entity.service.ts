import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreatePurchaseEntityDto } from './dto/create-purchase_entity.dto';
import { UpdatePurchaseEntityDto } from './dto/update-purchase_entity.dto';
import { PurchaseEntity } from './entities/purchase_entity.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { config } from 'dotenv';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';
import { BaseService } from '../common/services/base.service';

config();

@Injectable()
export class PurchaseEntityService extends BaseService<PurchaseEntity> {
  constructor(
    @Inject('PURCHASE_ENTITY_REPOSITORY')
    private purchaseEntityRepository: Repository<PurchaseEntity>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
  ) {
    super(purchaseEntityRepository);
  }

  async create(
    createPurchaseEntityDto: CreatePurchaseEntityDto,
    userBranchId: number,
  ) {
    if (userBranchId !== createPurchaseEntityDto.branchId) {
      throw new ConflictException(
        'Can not create a purchase entity outside your branch',
      );
    }

    // Check if the branchId exists in the Branch table
    const branch = await this.branchRepository.findOne({
      where: { id: createPurchaseEntityDto.branchId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    const existedEntity = await this.purchaseEntityRepository.findOne({
      where: {
        name: createPurchaseEntityDto.name,
        branchId: createPurchaseEntityDto.branchId,
      },
    });
    if (existedEntity)
      throw new ConflictException(
        `Purchase entity with name "${createPurchaseEntityDto.name}" already existed in this branch.`,
      );

    const newPurchase = this.purchaseEntityRepository.create(
      createPurchaseEntityDto,
    );
    return await this.purchaseEntityRepository.save(newPurchase);
  }

  async findAll(
    paginationDto: PaginationDto,
    branchId: number,
  ): Promise<PaginatedResult> {
    return super.findAll(paginationDto, branchId);
  }

  async findOne(id: number, branchId: number) {
    return super.findOne(id, branchId);
  }

  async findOneByName(name: string, branchId: number) {
    const purchaseEntity = await this.purchaseEntityRepository.findOne({
      where: { name, branchId },
    });
    if (!purchaseEntity)
      throw new NotFoundException(
        `There is no purchase entity named "${name}" in your branch!`,
      );
    return purchaseEntity;
  }

  async update(id: number, updatePurchaseEntityDto: UpdatePurchaseEntityDto) {
    // Retrieve the purchase entity by ID
    const purchaseEntity = await this.findPurchaseEntityByCondition(
      { id },
      'Purchase entity not found',
    );

    // If there are updates, assign them to the purchase entity
    if (Object.keys(updatePurchaseEntityDto).length > 0) {
      Object.assign(purchaseEntity, updatePurchaseEntityDto);
    }

    await this.purchaseEntityRepository.save(purchaseEntity);
    return purchaseEntity;
  }

  async remove(id: number, userBranchId: number) {
    const purchaseEntity = await this.findPurchaseEntityByCondition(
      { id },
      'Purchase entity not found',
    );

    if (userBranchId !== purchaseEntity.branch.id) {
      throw new ConflictException(
        'Can not delete a purchase entity outside your branch',
      );
    }

    await this.purchaseEntityRepository.softRemove(purchaseEntity);
    return purchaseEntity;
  }

  private async findPurchaseEntityByCondition(
    condition: object,
    errorMessage: string,
  ) {
    const purchaseEntity = await this.purchaseEntityRepository.findOne({
      where: condition,
      relations: ['branch'],
    });
    if (!purchaseEntity) {
      throw new NotFoundException(errorMessage);
    }
    return purchaseEntity;
  }
}
