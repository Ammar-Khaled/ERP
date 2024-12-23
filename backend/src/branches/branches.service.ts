import { Inject, Injectable } from '@nestjs/common';
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

  async findOne(id: number): Promise<Branch> {
    return this.branchRepository.findOne({ where: { id } });
  }

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    // check if branch has adderss
    if (createBranchDto.address) {
      // create address
      const address = await this.addressRepository.create(
        createBranchDto.address,
      );
      await this.addressRepository.save(address);
      createBranchDto.address = address;
    }
    return this.branchRepository.save(createBranchDto);
  }

  async update(id: number, updatedBranch: Branch): Promise<Branch> {
    await this.branchRepository.update(id, updatedBranch);
    return this.branchRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.branchRepository.delete(id);
  }
}
