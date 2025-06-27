import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
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
    if (updateCategoryDto.branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: updateCategoryDto.branchId },
      });
      if (!branch) {
        throw new NotFoundException('Branch not found.');
      }
      category.branch = branch;
    }

    // If there are updates, assign them to the category
    if (Object.keys(updateCategoryDto).length > 0) {
      Object.assign(category, updateCategoryDto);
    }

    await this.categoryRepository.save(category);
    return category;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Category>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.categoryRepository.findAndCount({
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
    return await this.findCategoryByCondition({ id }, 'Category not found');
  }

  async remove(id: number) {
    const category = await this.findCategoryByCondition(
      { id },
      'Category not found',
    );
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
