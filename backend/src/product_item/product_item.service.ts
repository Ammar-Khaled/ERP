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
import { UpdateDamagedDto } from './dto/update-damaged.dto';

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

  private async findProductItemByCondition(
    condition: object,
    errorMessage: string,
  ) {
    const productItem = await this.productItemRepository.findOne({
      where: condition,
      relations: ['product'], // Include the parent product relation
    });
    if (!productItem) {
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }
    return productItem;
  }
  async updateDamaged(updateDamagedDto: UpdateDamagedDto) {
  
    const { product_item_id, numberOfDamaged } = updateDamagedDto;

    // Validate inputs
    if (!product_item_id || isNaN(product_item_id)) {
      throw new HttpException(
        jsend.fail({ message: 'Invalid product_item_id.' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!numberOfDamaged || isNaN(numberOfDamaged)) {
      throw new HttpException(
        jsend.fail({ message: 'Invalid numberOfDamaged.' }),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find the product item by ID
    const productItem = await this.findProductItemByCondition(
      { id: product_item_id },
      'Product item not found.',
    );

    // Update the number_of_damaged
    productItem.number_of_damaged =
      (productItem.number_of_damaged || 0) + Number(numberOfDamaged);

    try {
      // Save the updated product item
      const updatedProductItem =
        await this.productItemRepository.save(productItem);
      return jsend.success(updatedProductItem);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message: 'An error occurred while updating the damaged count.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
