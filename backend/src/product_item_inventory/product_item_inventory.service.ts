import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductItemInventory } from './entities/product_item_inventory.entity';
import { ProductItem } from '../product_item/entities/product_item.entity';
import { Inventory } from '../inventories/entities/inventory.entity';
import { CreateProductItemInventoryDto } from './dto/create-product_item_inventory.dto';
import { UpdateProductItemInventoryDto } from './dto/update-product_item_inventory.dto';
import * as jsend from 'jsend';

@Injectable()
export class ProductItemInventoryService {
  constructor(
    @Inject('PRODUCT_ITEM_INVENTORY_REPOSITORY')
    private productItemInventoryRepository: Repository<ProductItemInventory>,
    @Inject('PRODUCT_ITEM_REPOSITORY')
    private productItemRepository: Repository<ProductItem>,
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async create(createProductItemInventoryDto: CreateProductItemInventoryDto) {
    const { product_item_id, inventory_id } = createProductItemInventoryDto;

    // Validate product_item_id
    const productItem = await this.productItemRepository.findOne({
      where: { id: product_item_id },
    });
    if (!productItem) {
      throw new NotFoundException(
        jsend.fail({ message: 'Product item not found.' }),
      );
    }

    // Validate inventory_id
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventory_id },
    });
    if (!inventory) {
      throw new NotFoundException(
        jsend.fail({ message: 'Inventory not found.' }),
      );
    }

    // Create and save the new ProductItemInventory
    const productItemInventory = this.productItemInventoryRepository.create(
      createProductItemInventoryDto,
    );

    try {
      const newProductItemInventory = await this.productItemInventoryRepository.save(
        productItemInventory,
      );
      return jsend.success(newProductItemInventory);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message:
            'An unexpected error occurred while creating the ProductItemInventory. Please try again later.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const productItemInventories =
      await this.productItemInventoryRepository.find({
        relations: ['productItem', 'inventory'], // Include related entities
      });
    return jsend.success(productItemInventories);
  }

  async findOne(id: number) {
    const productItemInventory = await this.findProductItemInventoryByCondition(
      { id },
      'ProductItemInventory not found',
    );
    return jsend.success(productItemInventory);
  }

  async update(
    id: number,
    updateProductItemInventoryDto: UpdateProductItemInventoryDto,
  ) {
    // Retrieve the existing ProductItemInventory
    const productItemInventory = await this.findProductItemInventoryByCondition(
      { id },
      'ProductItemInventory not found',
    );

    const { product_item_id, inventory_id, ...updates } =
      updateProductItemInventoryDto;

    // Validate and associate product_item_id if provided
    if (product_item_id) {
      const productItem = await this.productItemRepository.findOne({
        where: { id: product_item_id },
      });
      if (!productItem) {
        throw new NotFoundException(
          jsend.fail({ message: 'Product item not found.' }),
        );
      }
      productItemInventory.productItem = productItem;
    }

    // Validate and associate inventory_id if provided
    if (inventory_id) {
      const inventory = await this.inventoryRepository.findOne({
        where: { id: inventory_id },
      });
      if (!inventory) {
        throw new NotFoundException(
          jsend.fail({ message: 'Inventory not found.' }),
        );
      }
      productItemInventory.inventory = inventory;
    }

    // Apply other updates
    Object.assign(productItemInventory, updates);

    // Save the updated entity
    await this.productItemInventoryRepository.save(productItemInventory);

    return jsend.success(productItemInventory);
  }

  async remove(id: number) {
    const productItemInventory = await this.findProductItemInventoryByCondition(
      { id },
      'ProductItemInventory not found',
    );
    await this.productItemInventoryRepository.delete({ id });
    return jsend.success(productItemInventory);
  }

  private async findProductItemInventoryByCondition(
    condition: object,
    errorMessage: string,
  ) {
    const productItemInventory = await this.productItemInventoryRepository.findOne({
      where: condition,
      relations: ['productItem', 'inventory'], // Include related entities
    });
    if (!productItemInventory) {
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }
    return productItemInventory;
  }
}