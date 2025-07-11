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
import { Unit } from 'src/units/entities/unit.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { ProductItemService } from 'src/product_item/product_item.service';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class ProductsService extends BaseService<Product> {
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
  ) {
    super(productRepository);
  }

  async create(createProductDto: CreateProductDto, userBranchId: number) {
    if (userBranchId != createProductDto.branchId) {
      throw new ConflictException(
        'You cannot create a product for a different branch.',
      );
    }

    const existingProduct = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });
    if (existingProduct) {
      throw new ConflictException('The product already exists.');
    }

    const branch = await this.branchRepository.findOne({
      where: { id: createProductDto.branchId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    const unit = await this.unitRepository.findOne({
      where: { id: createProductDto.unitId },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found.');
    }

    const currency = await this.currencyRepository.findOne({
      where: { id: createProductDto.currencyId },
    });
    if (!currency) {
      throw new NotFoundException('Currency not found.');
    }

    const product = this.productRepository.create(createProductDto);

    try {
      const newProduct = await this.productRepository.save(product);

      // Create each ProductItem
      const productItems = [];

      if (createProductDto.productItems) {
        for (const itemDto of createProductDto.productItems) {
          const modifiedItemDto = {
            ...itemDto,
            product_id: newProduct.id, // Set the correct productId
          };

          // Create ProductItem via ProductItemService
          const result = await this.productItemService.create(modifiedItemDto);
          productItems.push(result);
        }

        // Assign the created product items to the response
        newProduct.productItems = productItems;
      }

      return newProduct;
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    paginationDto: PaginationDto,
    userBranchId: number,
  ): Promise<PaginatedResult> {
    return await super.findAll(paginationDto, userBranchId, [
      'branch',
      'category',
      'unit',
      'currency',
    ]);
  }

  async findOne(id: number, userBranchId: number) {
    return super.findOne(id, userBranchId);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // Retrieve the product by ID
    const product = await this.findProductByCondition(
      { id },
      'Product not found',
    );

    // Validate and link categoryId if provided
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found.');
      }
      product.category = category; // Associate the Category entity
      delete updateProductDto.categoryId;
    }

    // Validate and link unitId if provided
    if (updateProductDto.unitId) {
      const unit = await this.unitRepository.findOne({
        where: { id: updateProductDto.unitId },
      });
      if (!unit) {
        throw new NotFoundException('unit not found.');
      }
      product.unit = unit; // Associate the Category entity
    }

    // Validate and link currencyId if provided
    if (updateProductDto.currencyId) {
      const currency = await this.currencyRepository.findOne({
        where: { id: updateProductDto.currencyId },
      });
      if (!currency) {
        throw new NotFoundException('currency not found.');
      }
      product.currency = currency; // Associate the Category entity
    }

    // Update other fields from the DTO
    Object.assign(product, updateProductDto);

    // Save the updated product with relations
    await this.productRepository.save(product);

    return product;
  }

  async remove(id: number, userBranchId: number) {
    const product = await this.findProductByCondition(
      { id },
      'Product not found',
    );

    if (product.branch.id !== userBranchId) {
      throw new ConflictException(
        'You cannot delete a product from a different branch.',
      );
    }

    // delete product items associated with the product
    if (product.productItems && product.productItems.length > 0) {
      await this.productItemService.remove(id);
    }

    await this.productRepository.softDelete({ id });
    return product;
  }

  private async findProductByCondition(
    condition: object,
    errorMessage: string,
  ) {
    const product = await this.productRepository.findOne({
      where: condition,
      relations: ['productItems'], // Include relations for completeness
    });
    if (!product) {
      throw new NotFoundException(errorMessage);
    }
    return product;
  }
}
