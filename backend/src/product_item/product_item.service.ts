import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { ProductItem } from './entities/product_item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateProductItemDto } from './dto/create-product_item.dto';
import { UpdateProductItemDto } from './dto/update-product_item.dto';
import { UpdateDamagedDto } from './dto/update-damaged.dto';
import { UpdateExpiredDto } from './dto/update-expired.dto';
import { VariationOption } from 'src/variation_option/entities/variation_option.entity'; // Import the VariationOption entity
import { Variation } from 'src/variation/entities/variation.entity'; // Import the Variation entity
import { Currency } from 'src/currency/entities/currency.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Unit } from 'src/units/entities/unit.entity';
import { ProductItemInventoryService } from 'src/product_item_inventory/product_item_inventory.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductItemToInventory } from '../product_item_inventory/entities/product_item_inventory.entity';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class ProductItemService {
  constructor(
    @Inject('PRODUCT_ITEM_REPOSITORY')
    private productItemRepository: Repository<ProductItem>,
    @Inject('PRODUCT_REPOSITORY')
    private productRepository: Repository<Product>,
    @Inject('VARIATION_OPTION_REPOSITORY')
    private variationOptionRepository: Repository<VariationOption>, // Inject the VariationOption repository
    @Inject('BRANCH_REPOSITORY')
    private branchRepository: Repository<Branch>,
    @Inject('CATEGORY_REPOSITORY')
    private categoryRepository: Repository<Category>,
    @Inject('UNIT_REPOSITORY')
    private unitRepository: Repository<Unit>,
    @Inject('CURRENCY_REPOSITORY')
    private currencyRepository: Repository<Currency>,
    private productItemInventoryService: ProductItemInventoryService,
    private cloudinaryService: CloudinaryService,
    @Inject('PRODUCT_ITEM_INVENTORY_REPOSITORY')
    private productItemInventoryRepository: Repository<ProductItemToInventory>,
  ) {}

  async create(createProductItemDto: CreateProductItemDto) {
    const product = await this.productRepository.findOne({
      where: { id: createProductItemDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    // Create base product item entity
    const productItem = this.productItemRepository.create(createProductItemDto);

    // Process everything in a transaction
    return this.productItemRepository.manager.transaction(
      async (transactionalEntityManager) => {
        try {
          // Handle variation options
          if (createProductItemDto.variationOptions?.length) {
            const variationNames = [
              ...new Set(
                createProductItemDto.variationOptions.map(
                  (opt) => opt.variation.name,
                ),
              ),
            ];

            const existingVariations = await transactionalEntityManager
              .getRepository(Variation)
              .createQueryBuilder('variation')
              .where('variation.name IN (:...names)', { names: variationNames })
              .getMany();

            const newVariationNames = variationNames.filter(
              (name) => !existingVariations.some((v) => v.name === name),
            );

            const newVariations = newVariationNames.map((name) =>
              transactionalEntityManager
                .getRepository(Variation)
                .create({ name }),
            );

            if (newVariations.length > 0) {
              await transactionalEntityManager
                .getRepository(Variation)
                .insert(newVariations);
            }

            const allVariations = [
              ...existingVariations,
              ...newVariations,
            ].reduce((acc, variation) => {
              acc.set(variation.name, variation);
              return acc;
            }, new Map<string, Variation>());

            const variationOptions = createProductItemDto.variationOptions.map(
              (opt) => {
                const variation = allVariations.get(opt.variation.name);
                if (!variation) {
                  throw new NotFoundException(
                    `Variation ${opt.variation.name} not found`,
                  );
                }
                return transactionalEntityManager
                  .getRepository(VariationOption)
                  .create({
                    variation,
                    value: opt.value,
                  });
              },
            );

            productItem.variationOptions = await transactionalEntityManager
              .getRepository(VariationOption)
              .save(variationOptions);
          }

          // Save product item
          const newProductItem =
            await transactionalEntityManager.save(productItem);

          return newProductItem;
        } catch (error) {
          if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
            throw new ConflictException(
              `Product item with barcode '${createProductItemDto.barcode}' already exists`,
            );
          }

          throw new HttpException(
            error.message,
            error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      },
    );
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [productItems, total] = await this.productItemRepository.findAndCount(
      {
        skip,
        take: limit,
        relations: [
          'variationOptions',
          'variationOptions.variation',
          'product',
        ],
      },
    );

    const totalPages = Math.ceil(total / limit);

    const returnedProductItems = [];
    productItems.forEach((productItem) => {
      delete productItem.product.id;
      delete productItem.product.name;
      delete productItem.product.nameAr;
      const productDate = productItem.product;
      delete productItem.product;
      returnedProductItems.push({ ...productItem, ...productDate });
    });

    return {
      data: returnedProductItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async searchByName(
    searchName: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult> {
    if (!searchName || searchName.trim() === '') {
      throw new BadRequestException('Search name is required');
    }

    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Create query builder for complex search
    const queryBuilder = this.productItemRepository
      .createQueryBuilder('productItem')
      .leftJoinAndSelect('productItem.variationOptions', 'variationOptions')
      .leftJoinAndSelect('variationOptions.variation', 'variation')
      .leftJoinAndSelect('productItem.product', 'product')
      .where('productItem.deletedAt IS NULL') // Exclude soft deleted items
      .andWhere(
        '(LOWER(productItem.name) LIKE LOWER(:searchName) OR ' +
          'LOWER(productItem.nameAr) LIKE LOWER(:searchName) OR ' +
          'LOWER(product.name) LIKE LOWER(:searchName) OR ' +
          'LOWER(product.nameAr) LIKE LOWER(:searchName))',
        { searchName: `%${searchName.trim()}%` },
      )
      .skip(skip)
      .take(limit);

    const [productItems, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const returnedProductItems = [];
    productItems.forEach((productItem) => {
      delete productItem.product.id;
      delete productItem.product.name;
      delete productItem.product.nameAr;
      const productDate = productItem.product;
      delete productItem.product;
      returnedProductItems.push({ ...productItem, ...productDate });
    });

    return {
      data: returnedProductItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number) {
    const productItem = await this.findProductItemByCondition(
      { id },
      'Product item not found',
    );
    delete productItem.product.id;
    delete productItem.product.name;
    delete productItem.product.nameAr;
    const productDate = productItem.product;
    delete productItem.product;
    return { ...productItem, ...productDate };
  }

  async update(id: number, updateProductItemDto: UpdateProductItemDto) {
    // Retrieve the product item by ID
    const productItem = await this.findProductItemByCondition(
      { id },
      'Product item not found',
    );

    if (updateProductItemDto.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updateProductItemDto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found.');
      }
      productItem.product = product; // possible?
    }

    // Handle variation options - Keep existing ones & add new ones
    if (updateProductItemDto.variationOptions) {
      const existingVariationOptions = productItem.variationOptions || [];

      const updatedVariationOptions = await Promise.all(
        updateProductItemDto.variationOptions.map(async (optionDto) => {
          let variation = await this.variationOptionRepository.manager
            .getRepository(Variation)
            .createQueryBuilder('variation')
            .where('variation.name = :name', { name: optionDto.variation.name })
            .getOne();

          // ✅ If Variation doesn't exist, create it
          if (!variation) {
            variation = this.variationOptionRepository.manager
              .getRepository(Variation)
              .create({ name: optionDto.variation.name });

            variation = await this.variationOptionRepository.manager
              .getRepository(Variation)
              .save(variation);
          }

          // Check if this variation option already exists
          let variationOption = existingVariationOptions.find(
            (vo) =>
              vo.variation.id === variation.id && vo.value === optionDto.value,
          );

          if (!variationOption) {
            variationOption = this.variationOptionRepository.create({
              variation,
              value: optionDto.value,
            });

            variationOption =
              await this.variationOptionRepository.save(variationOption);
          }

          return variationOption;
        }),
      );

      productItem.variationOptions = updatedVariationOptions;
    }

    // Handle other fields update
    delete updateProductItemDto.variationOptions;

    // Ensure the provided fields are updated correctly
    Object.assign(productItem, updateProductItemDto);

    // Save the updated product item
    try {
      const updatedProductItem =
        await this.productItemRepository.save(productItem);
      return updatedProductItem;
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    const productItem = await this.findProductItemByCondition(
      { id },
      'Product item not found',
    );
    await this.productItemRepository.softDelete({ id });
    return productItem;
  }

  private async findProductItemByCondition(
    condition: object,
    errorMessage: string,
  ) {
    const productItem = await this.productItemRepository.findOne({
      where: condition,
      relations: ['variationOptions', 'variationOptions.variation', 'product'], //
    });
    if (!productItem) {
      throw new NotFoundException(errorMessage);
    }
    return productItem;
  }

  async updateDamaged(updateDamagedDto: UpdateDamagedDto) {
    const piis = [];
    for (const item of updateDamagedDto.items) {
      const { productItemId, inventoryId, numberOfDamaged } = item;

      // Validate inputs
      if (!productItemId || isNaN(productItemId)) {
        throw new BadRequestException('Invalid productItemId.');
      }

      if (!inventoryId || isNaN(inventoryId)) {
        throw new BadRequestException('Invalid inventoryId.');
      }

      if (!numberOfDamaged || isNaN(numberOfDamaged)) {
        throw new BadRequestException('Invalid totalNumberOfDamaged.');
      }

      // Find the product item by ID
      const pii = await this.productItemInventoryService.findOneByFK(
        productItemId,
        inventoryId,
      );
      if (!pii) {
        throw new NotFoundException(
          `Product item with ID ${productItemId} not found in inventory ${inventoryId}.`,
        );
      }

      // Update the number_of_damaged
      await this.productItemInventoryService.update(pii.id, {
        numberOfDamaged: pii.numberOfDamaged + numberOfDamaged,
        numberOfValid: pii.numberOfValid - numberOfDamaged,
      });
      piis.push(await this.productItemInventoryService.findOne(pii.id));
    }
    return piis;
  }

  async getDamaged() {
    // Query all product items where number_of_damaged is greater than 0
    const damagedItems = await this.productItemRepository.find({
      where: { totalNumberOfDamaged: MoreThan(0) }, // Filter by number_of_damaged > 0
    });
    return damagedItems;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadImage(id: number, file: Express.Multer.File, field: 'main') {
    const productItem = await this.findProductItemByCondition(
      { id },
      'Product item not found.',
    );

    const imageUrl = await this.cloudinaryService.uploadImage(file.buffer);

    productItem.mainPhoto = imageUrl;
    return await this.productItemRepository.save(productItem);
  }
  async uploadImages(id: number, files: Express.Multer.File[]) {
    const productItem = await this.findProductItemByCondition(
      { id },
      'Product item not found.',
    );

    const imageUrls = await Promise.all(
      files.map((file) => this.cloudinaryService.uploadImage(file.buffer)),
    );

    productItem.photos = imageUrls;
    return await this.productItemRepository.save(productItem);
  }

  async checkExpiredProducts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all product items with expiry date less than or equal to today
    const expiredProducts = await this.productItemRepository.find({
      where: {
        expiryDate: LessThanOrEqual(today),
      },
      relations: ['productItemToInventories'],
    });

    if (!expiredProducts.length) {
      return { message: 'No expired products found' };
    }

    const results = [];

    // Update each expired product's inventory
    for (const product of expiredProducts) {
      for (const inventory of product.productItemToInventories) {
        if (inventory.numberOfValid > 0) {
          // Only process inventories with valid items
          const updateResult = await this.markProductsAsExpired({
            productItemId: product.id,
            inventoryId: inventory.inventoryId,
            quantity: inventory.numberOfValid, // Move all valid items to damaged
          });

          results.push({
            productName: product.name,
            inventoryId: inventory.inventoryId,
            expiredQuantity: inventory.numberOfValid,
            result: updateResult,
          });
        }
      }
    }

    return {
      message: `${results.length} product inventories updated due to expiration`,
      details: results,
    };
  }

  async markProductsAsExpired(updateExpiredDto: UpdateExpiredDto) {
    const { productItemId, inventoryId, quantity } = updateExpiredDto;

    // Find the pii record
    let pii = await this.productItemInventoryRepository.findOne({
      where: {
        productItemId,
        inventoryId,
      },
    });

    if (!pii) {
      throw new NotFoundException(
        `No inventory record found for product item ${productItemId} in inventory ${inventoryId}`,
      );
    }

    // Calculate how many items to mark as expired
    const itemsToExpire = quantity
      ? Math.min(quantity, pii.numberOfValid)
      : pii.numberOfValid;

    if (itemsToExpire <= 0) {
      return { message: 'No valid items to mark as expired' };
    }

    pii = await this.productItemInventoryService.update(pii.id, {
      numberOfDamaged: pii.numberOfDamaged + itemsToExpire,
      numberOfValid: pii.numberOfValid - itemsToExpire,
    });

    return {
      message: `${itemsToExpire} items marked as expired`,
      inventoryRecord: pii,
    };
  }
}
