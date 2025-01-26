import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductItem } from './entities/product_item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateProductItemDto } from './dto/create-product_item.dto';
import { UpdateProductItemDto } from './dto/update-product_item.dto';
import * as jsend from 'jsend';

@Injectable()
export class ProductItemService {
  constructor(
    @Inject('PRODUCT_ITEM_REPOSITORY')
    private productItemRepository: Repository<ProductItem>,
    @Inject('PRODUCT_REPOSITORY')
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductItemDto: CreateProductItemDto) {
    // Check if a product item with the same barcode already exists
    const existingItem = await this.productItemRepository.findOne({
      where: { barcode: createProductItemDto.barcode },
    });
    if (existingItem) {
      throw new ConflictException(
        jsend.fail({ message: 'The product item already exists.' }),
      );
    }

    // Validate product_id
    const product = await this.productRepository.findOne({
      where: { id: createProductItemDto.product_id },
    });
    if (!product) {
      throw new NotFoundException(
        jsend.fail({ message: 'Parent product not found.' }),
      );
    }

    const productItem = this.productItemRepository.create(createProductItemDto);

    try {
      // Save the new product item
      const newProductItem = await this.productItemRepository.save(productItem);
      return jsend.success(newProductItem);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message:
            'An unexpected error occurred while creating the product item. Please try again later.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const productItems = await this.productItemRepository.find({
      relations: ['product'], // Include the parent product relation
    });
    return jsend.success(productItems);
  }

  async findOne(id: number) {
    const productItem = await this.findProductItemByCondition(
      { id },
      'Product item not found',
    );
    return jsend.success(productItem);
  }

  async update(id: number, updateProductItemDto: UpdateProductItemDto) {
    // Retrieve the product item by ID
    const productItem = await this.findProductItemByCondition(
      { id },
      'Product item not found',
    );

    // Validate and link product_id if provided
    if (updateProductItemDto.product_id) {
      const product = await this.productRepository.findOne({
        where: { id: updateProductItemDto.product_id },
      });
      if (!product) {
        throw new NotFoundException(
          jsend.fail({ message: 'Parent product not found.' }),
        );
      }
      productItem.product = product; // Associate the Product entity
    }

    // Update other fields from the DTO
    const { product_id, ...productItemUpdates } = updateProductItemDto;
    Object.assign(productItem, productItemUpdates);

    // Save the updated product item with relations
    await this.productItemRepository.save(productItem);

    return jsend.success(productItem);
  }

  async remove(id: number) {
    const productItem = await this.findProductItemByCondition(
      { id },
      'Product item not found',
    );
    await this.productItemRepository.delete({ id });
    return jsend.success(productItem);
  }

  private async findProductItemByCondition(condition: object, errorMessage: string) {
    const productItem = await this.productItemRepository.findOne({
      where: condition,
      relations: ['product'], // Include the parent product relation
    });
    if (!productItem) {
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }
    return productItem;
  }
}