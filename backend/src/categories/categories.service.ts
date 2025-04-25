import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Branch } from 'src/branches/entities/branch.entity'; // Assuming you have a Branch entity
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if a category with the same name already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (existingCategory) {
      throw new ConflictException('The category already exists.');
    }

    // Check if the branch_id exists in the Branch table
    const branch = await this.branchRepository.findOne({
      where: { id: createCategoryDto.branch_id },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    const category = this.categoryRepository.create(createCategoryDto);

    try {
      // Save the new category and associate it with the branch
      const newCategory = await this.categoryRepository.save(category);
      return newCategory;
    } catch (err) {
      throw new HttpException(err.message, err.status || 500);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Retrieve the category by ID
    const category = await this.findCategoryByCondition(
      { id },
      'Category not found',
    );

    // Check if the branch_id exists in the Branch table
    if (updateCategoryDto.branch_id) {
      const branch = await this.branchRepository.findOne({
        where: { id: updateCategoryDto.branch_id },
      });
      if (!branch) {
        throw new NotFoundException('Branch not found.');
      }
      category.branch = branch;
      delete updateCategoryDto.branch_id;
    }

    // If there are updates, assign them to the category
    if (Object.keys(updateCategoryDto).length > 0) {
      Object.assign(category, updateCategoryDto);

      // Save the category-ol0ml, 
      await this.categoryRepository.save(category);
    }

    return category;
  }

  async findAll() {
    const categories = await this.categoryRepository.find();
    return categories;
  }

  async findOne(id: number) {
    const category = await this.findCategoryByCondition(
      { id },
      'Category not found',
    );
    return category;
  }

  async remove(id: number) {
    const category = await this.findCategoryByCondition(
      { id },
      'Category not found',
    );
    await this.categoryRepository.delete({ id });
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
