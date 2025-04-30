import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { VariationOption } from './entities/variation_option.entity';
import { Variation } from '../variation/entities/variation.entity';
import { CreateVariationOptionDto } from './dto/create-variation_option.dto';
import { UpdateVariationOptionDto } from './dto/update-variation_option.dto';

@Injectable()
export class VariationOptionService {
  constructor(
    @Inject('VARIATION_OPTION_REPOSITORY')
    private variationOptionRepository: Repository<VariationOption>,

    @Inject('VARIATION_REPOSITORY')
    private variationRepository: Repository<Variation>,
  ) {}

  async create(createVariationOptionDto: CreateVariationOptionDto) {
    // Check if the referenced variation exists using the variation object
    const variation = await this.variationRepository.findOne({
      where: { name: createVariationOptionDto.variation.name },
    });

    if (!variation) {
      throw new NotFoundException('Variation not found.');
    }

    // Check if a variation option with the same value already exists for this variation
    const existingOption = await this.variationOptionRepository.findOne({
      where: {
        value: createVariationOptionDto.value,
        variation: variation, // Using variation object directly
      },
    });

    if (existingOption) {
      throw new ConflictException(
        'This variation option already exists for this variation.',
      );
    }

    // Create a new variation option
    const variationOption = this.variationOptionRepository.create({
      value: createVariationOptionDto.value,
      variation, // Using the variation object directly
    });

    try {
      return await this.variationOptionRepository.save(variationOption);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    return await this.variationOptionRepository.find({
      relations: ['variation'], // Include related variation data
    });
  }

  async findOne(id: number) {
    return await this.findVariationOptionByCondition(
      { id },
      'Variation option not found',
    );
  }

  async update(id: number, updateVariationOptionDto: UpdateVariationOptionDto) {
    const variationOption = await this.findVariationOptionByCondition(
      { id },
      'Variation option not found',
    );

    // If updating the variation, check if the new variation exists
    if (updateVariationOptionDto.variation) {
      const variation = await this.variationRepository.findOne({
        where: { name: updateVariationOptionDto.variation.name }, // Accessing variation.id
      });

      if (!variation) {
        throw new NotFoundException('Variation not found.');
      }

      variationOption.variation = variation;
    }

    // Update the variation option with the new value
    if (updateVariationOptionDto.value) {
      variationOption.value = updateVariationOptionDto.value;
    }

    await this.variationOptionRepository.save(variationOption);

    return variationOption;
  }

  async remove(id: number) {
    const variationOption = await this.findVariationOptionByCondition(
      { id },
      'Variation option not found',
    );
    await this.variationOptionRepository.delete({ id });
    return variationOption;
  }

  private async findVariationOptionByCondition(
    condition: object,
    errorMessage: string,
  ) {
    const variationOption = await this.variationOptionRepository.findOne({
      where: condition,
      relations: ['variation'],
    });

    if (!variationOption) {
      throw new NotFoundException(errorMessage);
    }

    return variationOption;
  }
}
