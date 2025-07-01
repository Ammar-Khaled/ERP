import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccountType } from './entities/account_type.entity';
import { CreateAccountTypeDto } from './dto/create-account_type.dto';
import { UpdateAccountTypeDto } from './dto/update-account_type.dto';

@Injectable()
export class AccountTypesService {
  constructor(
    @Inject('ACCOUNT_TYPE_REPOSITORY')
    private accountTypeRepo: Repository<AccountType>,
  ) {}

  async create(dto: CreateAccountTypeDto) {
    const newType = this.accountTypeRepo.create(dto);
    return this.accountTypeRepo.save(newType);
  }

  async findAll() {
    return this.accountTypeRepo.find();
  }

  async findOne(id: number) {
    const type = await this.accountTypeRepo.findOne({ where: { id } });
    if (!type) throw new NotFoundException('Account type not found');
    return type;
  }

  async update(id: number, dto: UpdateAccountTypeDto) {
    const type = await this.findOne(id);
    Object.assign(type, dto);
    return this.accountTypeRepo.save(type);
  }

  async remove(id: number) {
    const type = await this.findOne(id);
    await this.accountTypeRepo.softDelete(id);
    return type;
  }
}
