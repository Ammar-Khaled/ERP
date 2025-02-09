import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Variation } from './entities/variation.entity';
import { CreateVariationDto } from './dto/create-variation.dto';
import { UpdateVariationDto } from './dto/update-variation.dto';
import * as jsend from 'jsend';

@Injectable()
export class VariationService {
  constructor(
    @Inject('VARIATION_REPOSITORY')
    private variationRepository: Repository<Variation>,
  ) {}

  async create(createVariationDto: CreateVariationDto) {
    // Check if a variation with the same name already exists
    const existingVariation = await this.variationRepository.findOne({
      where: { name: createVariationDto.name },
    });

    if (existingVariation) {
      throw new ConflictException(
        jsend.fail({ message: 'The variation already exists.' }),
      );
    }

    const variation = this.variationRepository.create(createVariationDto);

    try {
      const newVariation = await this.variationRepository.save(variation);
      return jsend.success(newVariation);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message:
            'An unexpected error occurred while creating the variation. Please try again later.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const variations = await this.variationRepository.find();
    return jsend.success(variations);
  }

  async findOne(id: number) {
    const variation = await this.findVariationByCondition(
      { id },
      'Variation not found',
    );
    return jsend.success(variation);
  }

  async update(id: number, updateVariationDto: UpdateVariationDto) {
    const variation = await this.findVariationByCondition(
      { id },
      'Variation not found',
    );

    Object.assign(variation, updateVariationDto);
    await this.variationRepository.save(variation);

    return jsend.success(variation);
  }

  async remove(id: number) {
    const variation = await this.findVariationByCondition(
      { id },
      'Variation not found',
    );
    await this.variationRepository.delete({ id });
    return jsend.success(variation);
  }

  private async findVariationByCondition(condition: object, errorMessage: string) {
    const variation = await this.variationRepository.findOne({
      where: condition,
    });
    if (!variation) {
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }
    return variation;
  }
}