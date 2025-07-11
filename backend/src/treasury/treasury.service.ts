import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Treasury } from './entities/treasury.entity';
import { CreateTreasuryDto } from './dto/create-treasury.dto';
import { UpdateTreasuryDto } from './dto/update-treasury.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TreasuryService {
  constructor(
    @Inject('TREASURY_REPOSITORY')
    private treasuryRepo: Repository<Treasury>,
  ) {}

  async create(dto: CreateTreasuryDto) {
    // Check if user exists
    const user = await this.treasuryRepo.manager
      .getRepository(User)
      .findOne({ where: { id: dto.added_by } });

    if (!user) throw new NotFoundException('User (added_by) not found');

    const treasury = this.treasuryRepo.create({
      ...dto,
      current_balance: dto.starting_balance,
    });

    return this.treasuryRepo.save(treasury);
  }

  async findAll(filters?: { active?: string; type?: string }) {
    const where: any = {};

    if (filters?.active !== undefined) {
      where.is_active = filters.active === 'true';
    }

    if (filters?.type) {
      where.treasury_type = filters.type;
    }

    return this.treasuryRepo.find({
      where,
      relations: ['addedBy'],
    });
  }

  async findOne(id: number) {
    const treasury = await this.treasuryRepo.findOne({
      where: { id },
      relations: ['addedBy'],
    });

    if (!treasury) throw new NotFoundException('Treasury not found');
    return treasury;
  }

  async update(id: number, dto: UpdateTreasuryDto) {
    const treasury = await this.treasuryRepo.findOne({ where: { id } });

    if (!treasury) throw new NotFoundException('Treasury not found');

    Object.assign(treasury, dto);
    return this.treasuryRepo.save(treasury);
  }
}
