import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @Inject('SUPPLIER_REPOSITORY')
    private supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    const supplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async findAll() {
    return await this.supplierRepository.find();
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['purchaseRequests'],
    });

    if (!supplier) throw new NotFoundException('This supplier is not found');

    const purchaseRequestIds = supplier.purchaseRequests.map(
      (purchaseRequest) => purchaseRequest.id,
    );
    delete supplier.purchaseRequests;
    return { ...supplier, purchaseRequestIds };
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    if (!supplier) throw new NotFoundException('This supplier is not found');

    if (updateSupplierDto.address) {
      if (supplier.address?.id) {
        updateSupplierDto.address.id = supplier.address.id;
      }
    }

    Object.assign(supplier, updateSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    await this.supplierRepository.softRemove(supplier);
    return supplier;
  }
}
