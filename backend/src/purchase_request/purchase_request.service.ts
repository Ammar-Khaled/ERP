import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreatePurchaseRequestDto } from './dto/create-purchase_request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase_request.dto';
import { config } from 'dotenv';
import { PurchaseRequest } from './entities/purchase_request.entity';
import { User } from 'src/users/entities/user.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Status } from 'src/status/entities/status.entity';
import { Currency } from 'src/currency/entities/currency.entity';

config();

@Injectable()
export class PurchaseRequestService {
  constructor(
    @Inject('PURCHASE_REQUEST_REPOSITORY')
    private purchaseRequestRepository: Repository<PurchaseRequest>,
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('BRANCH_REPOSITORY') private branchRepository: Repository<Branch>,
    @Inject('SUPPLIER_REPOSITORY')
    private supplierRepository: Repository<Supplier>,
    @Inject('STATUS_REPOSITORY') private statusRepository: Repository<Status>,
    @Inject('CURRENCY_REPOSITORY')
    private currencyRepository: Repository<Currency>,
  ) {}

  async create(createPurchaseRequestDto: CreatePurchaseRequestDto) {
    return `This action creates a new purchaseRequest`;
  }

  async findAll() {
    return `This action returns all purchaseRequest`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} purchaseRequest`;
  }

  async update(id: number, updatePurchaseRequestDto: UpdatePurchaseRequestDto) {
    return `This action updates a #${id} purchaseRequest`;
  }

  async remove(id: number) {
    return `This action removes a #${id} purchaseRequest`;
  }
}
