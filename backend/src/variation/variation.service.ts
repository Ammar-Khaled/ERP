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
      throw new ConflictException('The variation already exists.');
    }

    const variation = this.variationRepository.create(createVariationDto);

    try {
      return await this.variationRepository.save(variation);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    return await this.variationRepository.find();
  }

  async findOne(id: number) {
    return await this.findVariationByCondition({ id }, 'Variation not found');
  }

  async update(id: number, updateVariationDto: UpdateVariationDto) {
    const variation = await this.findVariationByCondition(
      { id },
      'Variation not found',
    );

    Object.assign(variation, updateVariationDto);
    await this.variationRepository.save(variation);
    return variation;
  }

  async remove(id: number) {
    const variation = await this.findVariationByCondition(
      { id },
      'Variation not found',
    );
    await this.variationRepository.delete({ id });
    return variation;
  }

  private async findVariationByCondition(
    condition: object,
    errorMessage: string,
  ) {
    const variation = await this.variationRepository.findOne({
      where: condition,
    });
    if (!variation) {
      throw new NotFoundException(errorMessage);
    }
    return variation;
  }
}
