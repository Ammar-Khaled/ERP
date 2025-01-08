import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import * as jsend from 'jsend';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCT_REPOSITORY')
    private productRepository: Repository<Product>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Check if a product with the same name already exists
    const existingProduct = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });
    if (existingProduct) {
      throw new ConflictException(
        jsend.fail({ message: 'The product already exists.' }),
      );
    }

    // Validate branch_id
    const branch = await this.branchRepository.findOne({
      where: { id: createProductDto.branch_id },
    });
    if (!branch) {
      throw new NotFoundException(
        jsend.fail({ message: 'Branch not found.' }),
      );
    }

    // Validate category_id
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.category_id },
    });
    if (!category) {
      throw new NotFoundException(
        jsend.fail({ message: 'Category not found.' }),
      );
    }

    const product = this.productRepository.create(createProductDto);

    try {
      // Save the new product
      const newProduct = await this.productRepository.save(product);
      return jsend.success(newProduct);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message:
            'An unexpected error occurred while creating the product. Please try again later.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const products = await this.productRepository.find({
      relations: ['branch', 'category'], // Include branch and category relations
    });
    return jsend.success(products);
  }

  async findOne(id: number) {
    const product = await this.findProductByCondition(
      { id },
      'Product not found',
    );
    return jsend.success(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // Retrieve the product by ID
    const product = await this.findProductByCondition(
      { id },
      'Product not found',
    );
  
    // Validate and link branch_id if provided
    if (updateProductDto.branch_id) {
      const branch = await this.branchRepository.findOne({
        where: { id: updateProductDto.branch_id },
      });
      if (!branch) {
        throw new NotFoundException(
          jsend.fail({ message: 'Branch not found.' }),
        );
      }
      product.branch = branch; // Associate the Branch entity
    }
  
    // Validate and link category_id if provided
    if (updateProductDto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.category_id },
      });
      if (!category) {
        throw new NotFoundException(
          jsend.fail({ message: 'Category not found.' }),
        );
      }
      product.category = category; // Associate the Category entity
    }
  
    // Update other fields from the DTO
    const { branch_id, category_id, ...productUpdates } = updateProductDto;
    Object.assign(product, productUpdates);
  
    // Save the updated product with relations
    await this.productRepository.save(product);
  
    return jsend.success(product);
  }

  async remove(id: number) {
    const product = await this.findProductByCondition(
      { id },
      'Product not found',
    );
    await this.productRepository.delete({ id });
    return jsend.success(product);
  }

  private async findProductByCondition(condition: object, errorMessage: string) {
    const product = await this.productRepository.findOne({
      where: condition,
      relations: ['branch', 'category'], // Include relations for completeness
    });
    if (!product) {
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }
    return product;
  }
}