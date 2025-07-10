import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Treasury } from 'src/treasury/entities/treasury.entity';
import { Account } from 'src/accounts/entities/account.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('TRANSACTION_REPOSITORY')
    private transactionRepo: Repository<Transaction>,
  ) {}

  async create(dto: CreateTransactionDto) {
    const treasuryRepo = this.transactionRepo.manager.getRepository(Treasury);
    const accountRepo = this.transactionRepo.manager.getRepository(Account);
    const userRepo = this.transactionRepo.manager.getRepository(User);

    const treasury = await treasuryRepo.findOne({
      where: { id: dto.treasury_id },
    });
    if (!treasury) throw new NotFoundException('Treasury not found');

    const account = await accountRepo.findOne({
      where: { id: dto.account_id },
    });
    if (!account) throw new NotFoundException('Account not found');

    const user = await userRepo.findOne({ where: { id: dto.added_by } });
    if (!user) throw new NotFoundException('User (added_by) not found');

    // Create and save transaction
    const transaction = this.transactionRepo.create({
      ...dto,
      transaction_date: new Date(dto.transaction_date),
    });

    // Update balances
    treasury.current_balance =
      Number(treasury.current_balance) + Number(dto.amount);
    account.current_balance =
      Number(account.current_balance) + Number(dto.amount);
    await Promise.all([
      treasuryRepo.save(treasury),
      accountRepo.save(account),
      this.transactionRepo.save(transaction),
    ]);

    return transaction;
  }

  async findAll(filters: { account_id?: string; treasury_id?: string }) {
    const where: any = {};
    if (filters.account_id) where.account_id = +filters.account_id;
    if (filters.treasury_id) where.treasury_id = +filters.treasury_id;

    return this.transactionRepo.find({
      where,
      relations: ['treasury', 'account', 'addedBy'],
      order: { transaction_date: 'DESC' },
    });
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
      relations: ['treasury', 'account', 'addedBy'],
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async remove(id: number) {
    const transaction = await this.transactionRepo.findOne({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');

    return this.transactionRepo.softDelete(id);
  }
}
