import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { Address } from '../common/entities/address.entity';

@Injectable()
export class BranchesService {
  constructor(
    @Inject('BRANCH_REPOSITORY')
    private readonly branchRepository: Repository<Branch>,
    @Inject('ADDRESS_REPOSITORY')
    private readonly addressRepository: Repository<Address>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepository.find();
  }

  async findOneByCondition(
    condition: object,
    relations?: string[],
  ): Promise<Branch> {
    return await this.branchRepository.findOne({
      where: condition,
      relations: relations,
    });
  }

  async create(
    createBranchDto: CreateBranchDto,
  ): Promise<Promise<Branch> | ConflictException> {
    const existingBranch = await this.findOneByCondition({
      name: createBranchDto.name,
    });
    if (existingBranch) {
      throw new ConflictException('Branch already exists');
    }

    return this.branchRepository.save(createBranchDto);
  }

  async update(id: number, updatedBranchDto: Branch): Promise<Branch> {
    const branch = await this.findOneByCondition({ id });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (updatedBranchDto.address) {
      if (branch.address?.id) {
        updatedBranchDto.address.id = branch.address.id; // for cascading the update
      }
    }

    Object.assign(branch, updatedBranchDto);
    return await this.branchRepository.save(branch);
  }

  async remove(id: number): Promise<Branch> {
    let branch = await this.findOneByCondition({ id });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    branch = await this.branchRepository.softRemove(branch);
    return branch;
  }
}
