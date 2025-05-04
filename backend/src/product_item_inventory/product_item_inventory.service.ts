import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductItemToInventory } from './entities/product_item_inventory.entity';
import { ProductItem } from '../product_item/entities/product_item.entity';
import { Inventory } from '../inventories/entities/inventory.entity';
import { CreateProductItemInventoryDto } from './dto/create-product_item_inventory.dto';
import { UpdateProductItemInventoryDto } from './dto/update-product_item_inventory.dto';

@Injectable()
export class ProductItemInventoryService {
  constructor(
    @Inject('PRODUCT_ITEM_INVENTORY_REPOSITORY')
    private productItemInventoryRepository: Repository<ProductItemToInventory>,
    @Inject('PRODUCT_ITEM_REPOSITORY')
    private productItemRepository: Repository<ProductItem>,
    @Inject('INVENTORY_REPOSITORY')
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async create(createProductItemInventoryDto: CreateProductItemInventoryDto) {
    const { productItemId, inventoryId } = createProductItemInventoryDto;

    // Validate productItemId
    const productItem = await this.productItemRepository.findOne({
      where: { id: productItemId },
    });
    if (!productItem) {
      throw new NotFoundException('Product item not found.');
    }

    // Validate inventoryId
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found.');
    }

    // Check if the ProductItemInventory already exists
    const existingProductItemInventory =
      await this.productItemInventoryRepository.findOne({
        where: { productItemId, inventoryId },
      });

    if (existingProductItemInventory) {
      existingProductItemInventory.numberOfDamaged +=
        createProductItemInventoryDto.numberOfDamaged;
      existingProductItemInventory.numberOfValid +=
        createProductItemInventoryDto.numberOfValid;
      await this.productItemInventoryRepository.save(
        existingProductItemInventory,
      );
      return existingProductItemInventory;
    } else {
      // Create and save the new ProductItemInventory
      const productItemInventory = this.productItemInventoryRepository.create(
        createProductItemInventoryDto,
      );
      await this.productItemInventoryRepository.save(productItemInventory);
      return productItemInventory;
    }
  }

  async findAll() {
    return await this.productItemInventoryRepository.find();
  }

  async findOne(id: number) {
    const productItemInventory =
      await this.productItemInventoryRepository.findOneBy({ id });

    if (!productItemInventory) {
      throw new NotFoundException('ProductItem is not found in this inventory');
    }

    return productItemInventory;
  }

  async update(
    id: number,
    updateProductItemInventoryDto: UpdateProductItemInventoryDto,
  ) {
    // Retrieve the existing ProductItemInventory
    const productItemInventory =
      await this.productItemInventoryRepository.findOneBy({ id });

    if (!productItemInventory) {
      throw new NotFoundException('ProductItem is not found in this inventory');
    }

    const { productItemId, inventoryId, ...updates } =
      updateProductItemInventoryDto;

    // Validate and associate productItemId if provided
    if (productItemId) {
      const productItem = await this.productItemRepository.findOne({
        where: { id: productItemId },
      });
      if (!productItem) {
        throw new NotFoundException('Product item not found.');
      }
      productItemInventory.productItem = productItem;
    }

    // Validate and associate inventoryId if provided
    if (inventoryId) {
      const inventory = await this.inventoryRepository.findOne({
        where: { id: inventoryId },
      });
      if (!inventory) {
        throw new NotFoundException('Inventory not found.');
      }
      productItemInventory.inventory = inventory;
    }

    // Apply other updates
    Object.assign(productItemInventory, updates);

    // Save the updated entity
    await this.productItemInventoryRepository.save(productItemInventory);

    return productItemInventory;
  }

  async remove(id: number) {
    const productItemInventory =
      await this.productItemInventoryRepository.findOneBy({ id });

    if (!productItemInventory) {
      throw new NotFoundException('ProductItemInventory not found');
    }

    await this.productItemInventoryRepository.delete({ id });
    return productItemInventory;
  }
}
