import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';
import { Branch } from '../branches/entities/branch.entity';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class SuppliersService extends BaseService<Supplier> {
  constructor(
    @Inject('SUPPLIER_REPOSITORY')
    private supplierRepository: Repository<Supplier>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
  ) {
    super(supplierRepository);
  }

  async create(createSupplierDto: CreateSupplierDto, tokenPayload) {
    const supplier = this.supplierRepository.create({
      ...createSupplierDto,
      branch: await this.branchRepository.findOneBy({
        id: tokenPayload.branchId,
      }),
    });
    return await this.supplierRepository.save(supplier);
  }

  async findAll(
    paginationDto: PaginationDto,
    tokenPayload,
  ): Promise<PaginatedResult> {
    return await super.findAll(paginationDto, tokenPayload.branchId);
  }

  async findOne(id: number, tokenPayload): Promise<any> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, branchId: tokenPayload.branchId },
      relations: ['purchaseRequests'],
    });

    if (!supplier) throw new NotFoundException('This supplier is not found');

    const purchaseRequestIds = supplier.purchaseRequests.map(
      (purchaseRequest) => purchaseRequest.id,
    );
    delete supplier.purchaseRequests;
    return { ...supplier, purchaseRequestIds };
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto, tokenPayload) {
    const supplier = await this.findOne(id, tokenPayload);
    if (!supplier) throw new NotFoundException('This supplier is not found');

    if (updateSupplierDto.address) {
      if (supplier.address?.id) {
        updateSupplierDto.address.id = supplier.address.id;
      }
    }

    Object.assign(supplier, updateSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async remove(id: number, tokenPayload): Promise<Supplier> {
    const supplier = await this.findOne(id, tokenPayload);
    if (!supplier) throw new NotFoundException('This supplier is not found');
    await this.supplierRepository.softRemove(supplier);
    return supplier;
  }
}
