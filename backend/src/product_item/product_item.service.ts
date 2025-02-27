import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MoreThan, In, Repository } from 'typeorm';
import { ProductItem } from './entities/product_item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateProductItemDto } from './dto/create-product_item.dto';
import { UpdateProductItemDto } from './dto/update-product_item.dto';
import * as jsend from 'jsend';
import { UpdateDamagedDto } from './dto/update-damaged.dto';
import { VariationOption } from 'src/variation_option/entities/variation_option.entity'; // Import the VariationOption entity
import { Variation } from 'src/variation/entities/variation.entity'; // Import the Variation entity
import { ProductItemToInventory } from 'src/product_item_inventory/entities/product_item_inventory.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Unit } from 'src/units/entities/unit.entity';
import { ProductItemInventoryService } from 'src/product_item_inventory/product_item_inventory.service';
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
  ) {}

  async create(createProductItemDto: CreateProductItemDto) {
    // Create base product item entity
    const productItem = this.productItemRepository.create({
      ...createProductItemDto,
    });

    const product = await this.productRepository.findOne({
      where: { id: createProductItemDto.product_id },
    });
    if (!product) {
      throw new NotFoundException(
        jsend.fail({ message: 'Product not found.' }),
      );
    }

    // Process variations in a transaction
    return this.productItemRepository.manager.transaction(
      async (transactionalEntityManager) => {
        try {
          // Process variation options if provided
          if (createProductItemDto.variationOptions?.length) {
            const variationNames = [
              ...new Set(
                createProductItemDto.variationOptions.map(
                  (opt) => opt.variation.name,
                ),
              ),
            ];

            // Get or create variations in a single query
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

            // Create variation options
            const variationOptions = createProductItemDto.variationOptions.map(
              (opt) => {
                const variation = allVariations.get(opt.variation.name);
                if (!variation) {
                  throw new NotFoundException(
                    jsend.fail({
                      message: `Variation ${opt.variation.name} not found`,
                    }),
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

          // Create inventory record if needed
          if (createProductItemDto.inventory_id) {
            await transactionalEntityManager
              .getRepository(ProductItemToInventory)
              .insert({
                number_of_items: createProductItemDto.total_items,
                number_of_damaged: createProductItemDto.number_of_damaged || 0,
                product_item_id: newProductItem.id,
                inventory_id: createProductItemDto.inventory_id,
              });
          }

          return jsend.success(newProductItem);
        } catch (error) {
          // Handle unique constraint violation (barcode check)
          if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
            throw new ConflictException(
              jsend.fail({
                message: `Product item with barcode '${createProductItemDto.barcode}' already exists`,
              }),
            );
          }

          throw new HttpException(
            jsend.error({
              message:
                'An unexpected error occurred while creating the product item.',
              data: error,
            }),
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      },
    );
  }
  async findAll() {
    const productItems = await this.productItemRepository.find({
      relations: [
        'productItemToInventories',
        'variationOptions',
        'variationOptions.variation',
      ], // Include the variation relation
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

    if (updateProductItemDto.product_id) {
      const product = await this.productRepository.findOne({
        where: { id: updateProductItemDto.product_id },
      });
      if (!product) {
        throw new NotFoundException(
          jsend.fail({ message: 'Product not found.' }),
        );
      }
      productItem.product = product; // Associate the Branch entity
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
    const { variationOptions, ...productItemUpdates } = updateProductItemDto;

    // Ensure the provided fields are updated correctly
    Object.assign(productItem, productItemUpdates);

    // Save the updated product item
    try {
      const updatedProductItem =
        await this.productItemRepository.save(productItem);
      return jsend.success(updatedProductItem);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message: 'An error occurred while updating the product item.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      relations: ['variationOptions', 'variationOptions.variation'], // ✅ Removed 'product'
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

  async getDamaged() {
    // Query all product items where number_of_damaged is greater than 0
    const damagedItems = await this.productItemRepository.find({
      where: { number_of_damaged: MoreThan(0) }, // Filter by number_of_damaged > 0
    });
    return jsend.success(damagedItems);
  }
}
