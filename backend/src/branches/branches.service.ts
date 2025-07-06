import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class BranchesService implements OnModuleInit {
  constructor(
    @Inject('BRANCH_REPOSITORY')
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async onModuleInit() {
    // await this.branchRepository.save({
    //   name: 'Main Branch',
    //   nameAr: 'الفرع الرئيسي',
    // });
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Branch>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.branchRepository.findAndCount({
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
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
    console.log(createBranchDto);
    const branch = this.branchRepository.create(createBranchDto);
    console.log(branch);
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
