import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @Inject('BRANCH_REPOSITORY')
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepository.find();
  }

  async findOne(id: number): Promise<Branch> {
    return this.branchRepository.findOne({ where: { id } });
  }

  async create(branch: Branch): Promise<Branch> {
    return this.branchRepository.save(branch);
  }

  async update(id: number, updatedBranch: Branch): Promise<Branch> {
    await this.branchRepository.update(id, updatedBranch);
    return this.branchRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.branchRepository.delete(id);
  }
}
