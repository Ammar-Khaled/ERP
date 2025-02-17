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
import * as jsend from 'jsend';

@Injectable()
export class VariationOptionService {
  constructor(
    @Inject('VARIATION_OPTION_REPOSITORY')
    private variationOptionRepository: Repository<VariationOption>,

    @Inject('VARIATION_REPOSITORY')
    private variationRepository: Repository<Variation>,
  ) {}

  async create(createVariationOptionDto: CreateVariationOptionDto) {
    // Check if the referenced variation exists
    const variation = await this.variationRepository.findOne({
      where: { id: createVariationOptionDto.variation_id },
    });

    if (!variation) {
      throw new NotFoundException(
        jsend.fail({ message: 'Variation not found.' }),
      );
    }

    // Check if a variation option with the same value already exists for this variation
    const existingOption = await this.variationOptionRepository.findOne({
      where: {
        value: createVariationOptionDto.value,
        variation_id: createVariationOptionDto.variation_id,
      },
    });

    if (existingOption) {
      throw new ConflictException(
        jsend.fail({
          message: 'This variation option already exists for this variation.',
        }),
      );
    }

    // Create a new variation option
    const variationOption = this.variationOptionRepository.create({
      ...createVariationOptionDto,
    });

    try {
      const newVariationOption =
        await this.variationOptionRepository.save(variationOption);
      return jsend.success(newVariationOption);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message: 'An error occurred while creating the variation option.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const variationOptions = await this.variationOptionRepository.find({
      relations: ['variation'], // Include related variation data
    });
    return jsend.success(variationOptions);
  }

  async findOne(id: number) {
    const variationOption = await this.findVariationOptionByCondition(
      { id },
      'Variation option not found',
    );
    return jsend.success(variationOption);
  }

  async update(id: number, updateVariationOptionDto: UpdateVariationOptionDto) {
    const variationOption = await this.findVariationOptionByCondition(
      { id },
      'Variation option not found',
    );

    // If updating the variation_id, check if the new variation exists
    if (updateVariationOptionDto.variation_id) {
      const variation = await this.variationRepository.findOne({
        where: { id: updateVariationOptionDto.variation_id },
      });

      if (!variation) {
        throw new NotFoundException(
          jsend.fail({ message: 'Variation not found.' }),
        );
      }

      variationOption.variation_id = updateVariationOptionDto.variation_id;
      variationOption.variation = variation;
    }

    Object.assign(variationOption, updateVariationOptionDto);
    await this.variationOptionRepository.save(variationOption);

    return jsend.success(variationOption);
  }

  async remove(id: number) {
    const variationOption = await this.findVariationOptionByCondition(
      { id },
      'Variation option not found',
    );
    await this.variationOptionRepository.delete({ id });
    return jsend.success(variationOption);
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
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }

    return variationOption;
  }
}
