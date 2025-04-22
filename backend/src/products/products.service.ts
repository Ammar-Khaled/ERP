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
import { Unit } from 'src/units/entities/unit.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { ProductItemService } from 'src/product_item/product_item.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCT_REPOSITORY')
    private productRepository: Repository<Product>,
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
    @Inject('UNIT_REPOSITORY')
    private unitRepository: Repository<Unit>,
    @Inject('CURRENCY_REPOSITORY')
    private currencyRepository: Repository<Currency>,
    private productItemService: ProductItemService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const existingProduct = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });
    if (existingProduct) {
      throw new ConflictException(
        jsend.fail({ message: 'The product already exists.' }),
      );
    }

    const branch = await this.branchRepository.findOne({
      where: { id: createProductDto.branch_id },
    });
    if (!branch) {
      throw new NotFoundException(jsend.fail({ message: 'Branch not found.' }));
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.category_id },
    });
    if (!category) {
      throw new NotFoundException(
        jsend.fail({ message: 'Category not found.' }),
      );
    }

    const unit = await this.unitRepository.findOne({
      where: { id: createProductDto.unit_id },
    });
    if (!unit) {
      throw new NotFoundException(jsend.fail({ message: 'Unit not found.' }));
    }

    const currency = await this.currencyRepository.findOne({
      where: { id: createProductDto.currency_id },
    });
    if (!currency) {
      throw new NotFoundException(
        jsend.fail({ message: 'Currency not found.' }),
      );
    }

    const product = this.productRepository.create(createProductDto);

    try {
      const newProduct = await this.productRepository.save(product);

      // Create each ProductItem
      const productItems = [];
      for (const itemDto of createProductDto.productItems) {
        const modifiedItemDto = {
          ...itemDto,
          product_id: newProduct.id, // Set the correct product_id
        };

        // Create ProductItem via ProductItemService
        const result = await this.productItemService.create(modifiedItemDto);
        productItems.push(result.data);
      }

      // Assign the created product items to the response
      newProduct.productItems = productItems;

      return jsend.success(newProduct);
    } catch (err) {
      // Handle specific error cases
      if (err instanceof ConflictException) {
        throw err;
      }
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
      relations: [
        'branch',
        'category',
        'unit',
        'currency',
        'productItems',
        'productItems.variationOptions',
        'productItems.variationOptions.variation',
      ], // Include branch and category relations
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
    
    // Validate and link unit_id if provided
    if (updateProductDto.unit_id) {
      const unit = await this.unitRepository.findOne({
        where: { id: updateProductDto.unit_id },
      });
      if (!unit) {
        throw new NotFoundException(jsend.fail({ message: 'unit not found.' }));
      }
      product.unit = unit; // Associate the Category entity
    }

    // Validate and link currency_id if provided
    if (updateProductDto.currency_id) {
      const currency = await this.currencyRepository.findOne({
        where: { id: updateProductDto.currency_id },
      });
      if (!currency) {
        throw new NotFoundException(
          jsend.fail({ message: 'currency not found.' }),
        );
      }
      product.currency = currency; // Associate the Category entity
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

  private async findProductByCondition(
    condition: object,
    errorMessage: string,
  ) {
    const product = await this.productRepository.findOne({
      where: condition,
      relations: [
        'branch',
        'category',
        'unit',
        'currency',
        'productItems',
        'productItems.variationOptions',
        'productItems.variationOptions.variation',
      ], // Include relations for completeness
    });
    if (!product) {
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }
    return product;
  }
}
