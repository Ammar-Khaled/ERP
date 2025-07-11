import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, ILike } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { User } from 'src/users/entities/user.entity';
import { AccountType } from 'src/account_types/entities/account_type.entity';
@Injectable()
export class AccountService {
  constructor(
    @Inject('ACCOUNT_REPOSITORY')
    private accountRepository: Repository<Account>,
  ) {}

  async create(dto: CreateAccountDto) {
    const existing = await this.accountRepository.findOne({
      where: { account_number: dto.account_number },
    });

    if (existing) {
      throw new ConflictException('Account number already exists');
    }

    // ✅ Validate account_type_id
    const accountType = await this.accountRepository.manager
      .getRepository(AccountType)
      .findOne({ where: { id: dto.account_type_id } });

    if (!accountType) {
      throw new NotFoundException('Account type not found');
    }

    // ✅ Validate added_by (user_id)
    const user = await this.accountRepository.manager
      .getRepository(User)
      .findOne({ where: { id: dto.added_by } });

    if (!user) {
      throw new NotFoundException('User (added_by) not found');
    }

    const account = this.accountRepository.create({
      ...dto,
      current_balance: dto.start_balance,
    });

    return this.accountRepository.save(account);
  }
  async findAll(filter?: { type?: string; archived?: string }) {
    const where: any = {};

    if (filter?.archived !== undefined) {
      where.is_archieved = filter.archived === 'true';
    }

    // Type filter by account_type.name if needed via join (not implemented here, assumed externally handled)

    return this.accountRepository.find({
      where,
      relations: ['accountType', 'addedBy'],
    });
  }

  async findOne(id: number) {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['accountType', 'addedBy'],
    });

    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async findByAccountNumber(number: string) {
    const account = await this.accountRepository.findOne({
      where: { account_number: number },
      relations: ['accountType', 'addedBy'],
    });

    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async update(id: number, dto: UpdateAccountDto) {
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) throw new NotFoundException('Account not found');

    Object.assign(account, dto);
    return this.accountRepository.save(account);
  }
}
