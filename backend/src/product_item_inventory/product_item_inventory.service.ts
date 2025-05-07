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
import { TransferProductItemsDto } from './dto/transfer-product-items.dto';

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

      // Update the product item totals
      productItem.totalNumberOfValid +=
        createProductItemInventoryDto.numberOfValid || 0;
      productItem.totalNumberOfDamaged +=
        createProductItemInventoryDto.numberOfDamaged || 0;
      await this.productItemRepository.save(productItem);

      // Update the inventory totals
      inventory.totalNumberOfValid +=
        createProductItemInventoryDto.numberOfValid || 0;
      inventory.totalNumberOfDamaged +=
        createProductItemInventoryDto.numberOfDamaged || 0;
      await this.inventoryRepository.save(inventory);

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

    // update the product item and inventory totals
    const productItem = await this.productItemRepository.findOneBy({
      id: productItemInventory.productItemId,
    });
    if (!productItem) {
      throw new NotFoundException('Product item not found.');
    }

    const inventory = await this.inventoryRepository.findOneBy({
      id: productItemInventory.inventoryId,
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found.');
    }

    if (updateProductItemInventoryDto.numberOfValid !== undefined) {
      const diff =
        updateProductItemInventoryDto.numberOfValid -
        productItemInventory.numberOfValid;

      productItem.totalNumberOfValid += diff;
      inventory.totalNumberOfValid += diff;
    }

    if (updateProductItemInventoryDto.numberOfDamaged !== undefined) {
      const diff =
        updateProductItemInventoryDto.numberOfDamaged -
        productItemInventory.numberOfDamaged;
      productItem.totalNumberOfDamaged += diff;
      inventory.totalNumberOfDamaged += diff;
    }

    await this.productItemRepository.save(productItem);
    await this.inventoryRepository.save(inventory);
    Object.assign(productItemInventory, updateProductItemInventoryDto);
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

    const inventory = await this.inventoryRepository.findOneBy({
      id: productItemInventory.inventoryId,
    });
    if (!inventory) {
      throw new NotFoundException('inventory not found.');
    }

    await this.productItemInventoryRepository.delete({ id });

    // update the product item and inventory totals
    productItem.totalNumberOfValid -= productItemInventory.numberOfValid;
    productItem.totalNumberOfDamaged -= productItemInventory.numberOfDamaged;

    inventory.totalNumberOfValid -= productItemInventory.numberOfValid;
    inventory.totalNumberOfDamaged -= productItemInventory.numberOfDamaged;

    await this.productItemRepository.save(productItem);

    await this.inventoryRepository.save(inventory);

    return productItemInventory;
  }

  async transferProductItems(transferProductItemsDto: TransferProductItemsDto) {
    // get the source inventory
    const sourceInventory = await this.inventoryRepository.findOneBy({
      id: transferProductItemsDto.sourceInventoryId,
    });
    if (!sourceInventory) {
      throw new ConflictException(
        'Source inventory not found with id: ' +
          transferProductItemsDto.sourceInventoryId,
      );
    }

    // get the target inventory
    const targetInventory = await this.inventoryRepository.findOneBy({
      id: transferProductItemsDto.targetInventoryId,
    });
    if (!targetInventory) {
      throw new ConflictException(
        'Target inventory not found with id: ' +
          transferProductItemsDto.targetInventoryId,
      );
    }

    // validate the source and target inventories
    if (sourceInventory.id === targetInventory.id) {
      throw new ConflictException(
        'Source and target inventories cannot be the same',
      );
    }

    // validate the product item
    const productItem = await this.productItemRepository.findOneBy({
      id: transferProductItemsDto.productItemId,
    });
    if (!productItem) {
      throw new ConflictException(
        'Product item not found with id: ' +
          transferProductItemsDto.productItemId,
      );
    }

    // get the source product item inventory
    const sourceProductItemInventory =
      await this.productItemInventoryRepository.findOneBy({
        inventoryId: transferProductItemsDto.sourceInventoryId,
        productItemId: transferProductItemsDto.productItemId,
      });

    if (!sourceProductItemInventory) {
      throw new ConflictException(
        'Product item not found with id: ' +
          transferProductItemsDto.productItemId +
          'in inventory with id: ' +
          transferProductItemsDto.sourceInventoryId,
      );
    }

    if (
      sourceProductItemInventory.numberOfValid <
        transferProductItemsDto.numberOfValid ||
      sourceProductItemInventory.numberOfDamaged <
        transferProductItemsDto.numberOfDamaged
    ) {
      throw new ConflictException('Not enough items in source inventory');
    }

    sourceProductItemInventory.numberOfValid -=
      transferProductItemsDto.numberOfValid;
    sourceProductItemInventory.numberOfDamaged -=
      transferProductItemsDto.numberOfDamaged;

    await this.update(sourceProductItemInventory.id, {
      numberOfValid: sourceProductItemInventory.numberOfValid,
      numberOfDamaged: sourceProductItemInventory.numberOfDamaged,
    });

    // get the target product item inventory
    const targetProductItemInventory =
      await this.productItemInventoryRepository.findOneBy({
        inventoryId: transferProductItemsDto.targetInventoryId,
        productItemId: transferProductItemsDto.productItemId,
      });

    if (targetProductItemInventory) {
      targetProductItemInventory.numberOfValid +=
        transferProductItemsDto.numberOfValid;
      targetProductItemInventory.numberOfDamaged +=
        transferProductItemsDto.numberOfDamaged;

      return await this.update(targetProductItemInventory.id, {
        numberOfValid: targetProductItemInventory.numberOfValid,
        numberOfDamaged: targetProductItemInventory.numberOfDamaged,
      });
    } else {
      return await this.create({
        inventoryId: transferProductItemsDto.targetInventoryId,
        productItemId: transferProductItemsDto.productItemId,
        numberOfValid: transferProductItemsDto.numberOfValid,
        numberOfDamaged: transferProductItemsDto.numberOfDamaged,
      });
    }
  }
}
