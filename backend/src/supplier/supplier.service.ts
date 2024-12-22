import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { Address } from 'src/common/entities/address.entity';

@Injectable()
export class SupplierService {
  constructor(
    @Inject('SUPPLIER_REPOSITORY')
    private supplierRepository: Repository<Supplier>,
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    // check if the supplier is already exist
    const existingSupplier = await this.supplierRepository.findOne({
      where: { email: createSupplierDto.email },
    });
    if (existingSupplier)
      throw new ConflictException('The Supplier is already exist');

    // create an entities
    const supplier = this.supplierRepository.create(createSupplierDto);
    if (createSupplierDto.address) {
      const address = this.addressRepository.create(createSupplierDto.address);
      await this.addressRepository.save(address);
      supplier.address = address;
    }

    // save and return
    console.log('Supplier created.');
    return await this.supplierRepository.save(supplier);
  }

  async findAll() {
    return await this.supplierRepository.find();
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepository.findOneBy({ id });
    if (!supplier) throw new NotFoundException('This supplier is not found');

    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);

    Object.assign(supplier, updateSupplierDto);
    if (updateSupplierDto.address)
      Object.assign(supplier.address, updateSupplierDto.address);

    await this.addressRepository.save(updateSupplierDto.address);
    return await this.supplierRepository.save(supplier);
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    await this.supplierRepository.delete({ id });
    console.log('Deleted a supplier.');
    return supplier;
  }
}
