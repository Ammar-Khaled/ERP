import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @Inject('BRANCH_REPOSITORY')
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepository.find();
  }

  async findOne(id: number) {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: {
        users: true,
        inventories: true,
        purchaseRequests: true,
      },
      select: {
        // users: {
        //   id: true,
        // },
        inventories: {
          id: true,
        },
        purchaseRequests: {
          id: true,
        },
      },
    });

    if (!branch) throw new NotFoundException('Branch not found');

    const userIds = branch.users.map((user) => user.id);
    delete branch.users;
    const inventoryIds = branch.inventories.map((inventory) => inventory.id);
    delete branch.inventories;
    const purchaseRequestIds = branch.purchaseRequests.map(
      (purchaseRequest) => purchaseRequest.id,
    );
    delete branch.purchaseRequests;
    return { ...branch, userIds, inventoryIds, purchaseRequestIds };
  }

  async create(createBranchDto: CreateBranchDto) {
    const branch = this.branchRepository.create(createBranchDto);
    return await this.branchRepository.save(branch);
  }

  async update(id: number, updatedBranchDto: Branch): Promise<Branch> {
    const branch = await this.branchRepository.findOneBy({ id });
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
    let branch = await this.branchRepository.findOneBy({ id });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    branch = await this.branchRepository.softRemove(branch);
    return branch;
  }
}
