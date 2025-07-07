import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class CategoriesService extends BaseService<Category> {
  constructor(
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
  ) {
    super(categoryRepository);
  }

  async create(createCategoryDto: CreateCategoryDto, userBranchId: number) {
    if (userBranchId !== createCategoryDto.branchId) {
      throw new ConflictException(
        'Can not create a category outside your branch',
      );
    }

    // Check if the branchId exists in the Branch table
    const branch = await this.branchRepository.findOne({
      where: { id: createCategoryDto.branchId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return await this.categoryRepository.save(createCategoryDto);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Retrieve the category by ID
    const category = await this.findCategoryByCondition(
      { id },
      'Category not found',
    );

    // Check if the branchId exists in the Branch table
    // if (updateCategoryDto.branchId) {
    //   const branch = await this.branchRepository.findOne({
    //     where: { id: updateCategoryDto.branchId },
    //   });
    //   if (!branch) {
    //     throw new NotFoundException('Branch not found.');
    //   }
    //   category.branch = branch;
    // }

    // If there are updates, assign them to the category
    if (Object.keys(updateCategoryDto).length > 0) {
      Object.assign(category, updateCategoryDto);
    }

    await this.categoryRepository.save(category);
    return category;
  }

  async findAll(
    paginationDto: PaginationDto,
    branchId: number,
  ): Promise<PaginatedResult<Category>> {
    return super.findAll(paginationDto, branchId);
  }

  async findOne(id: number, branchId: number) {
    return super.findOne(id, branchId);
  }

  async remove(id: number, userBranchId: number) {
    const category = await this.findCategoryByCondition(
      { id },
      'Category not found',
    );

    if (userBranchId !== category.branch.id) {
      throw new ConflictException(
        'Can not delete a category outside your branch',
      );
    }

    await this.categoryRepository.softRemove(category);
    return category;
  }

  private async findCategoryByCondition(
    condition: object,
    errorMessage: string,
  ) {
    const category = await this.categoryRepository.findOne({
      where: condition,
    });
    if (!category) {
      throw new NotFoundException(errorMessage);
    }
    return category;
  }
}
