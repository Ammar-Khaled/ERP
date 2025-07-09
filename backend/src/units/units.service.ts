import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class UnitsService {
  constructor(
    @Inject('UNIT_REPOSITORY')
    private unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto) {
    // Check if a unit with the same name already exists
    const existingUnit = await this.unitRepository.findOne({
      where: { name: createUnitDto.name },
    });
    if (existingUnit) {
      throw new ConflictException('The unit already exists.');
    }

    const unit = this.unitRepository.create(createUnitDto);

    try {
      // Save the new unit
      return await this.unitRepository.save(unit);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.unitRepository.findAndCount({
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
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
    return await this.findUnitByCondition({ id }, 'Unit not found');
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    const unit = await this.findUnitByCondition({ id }, 'Unit not found');

    Object.assign(unit, updateUnitDto);

    try {
      return await this.unitRepository.save(unit);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    const unit = await this.findUnitByCondition({ id }, 'Unit not found');
    await this.unitRepository.delete({ id });
    return unit;
  }

  private async findUnitByCondition(condition: object, errorMessage: string) {
    const unit = await this.unitRepository.findOne({ where: condition });
    if (!unit) {
      throw new NotFoundException(errorMessage);
    }
    return unit;
  }
}
