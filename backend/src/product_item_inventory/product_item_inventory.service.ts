import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new ConflictException(
        'A record for this ProductItemInventory already exists, consider updating it instead.',
      );
    } else {
      const productItemInventory = this.productItemInventoryRepository.create(
        createProductItemInventoryDto,
      );

      await this.productItemInventoryRepository.save(productItemInventory);

      productItem.numberOfValid +=
        createProductItemInventoryDto.numberOfValid || 0;
      productItem.numberOfDamaged +=
        createProductItemInventoryDto.numberOfDamaged || 0;
      await this.productItemRepository.save(productItem);

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

    const productItem = await this.productItemRepository.findOneBy({
      id: productItemInventory.productItemId,
    });
    if (!productItem) {
      throw new NotFoundException('Product item not found.');
    }

    if (updateProductItemInventoryDto.numberOfValid !== undefined) {
      productItem.numberOfValid +=
        updateProductItemInventoryDto.numberOfValid -
        productItemInventory.numberOfValid;
    }

    if (updateProductItemInventoryDto.numberOfDamaged !== undefined) {
      productItem.numberOfDamaged +=
        updateProductItemInventoryDto.numberOfDamaged -
        productItemInventory.numberOfDamaged;
    }

    await this.productItemRepository.save(productItem);

    // Apply other updates
    Object.assign(productItemInventory, updateProductItemInventoryDto);

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

    const productItem = await this.productItemRepository.findOneBy({
      id: productItemInventory.productItemId,
    });

    if (!productItem) {
      throw new NotFoundException('Product item not found.');
    }

    productItem.numberOfValid -= productItemInventory.numberOfValid;
    productItem.numberOfDamaged -= productItemInventory.numberOfDamaged;

    await this.productItemRepository.save(productItem);

    await this.productItemInventoryRepository.delete({ id });
    return productItemInventory;
  }
}
