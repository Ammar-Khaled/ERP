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
import * as jsend from 'jsend';

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
      throw new ConflictException(
        jsend.fail({ message: 'The unit already exists.' }),
      );
    }

    const unit = this.unitRepository.create(createUnitDto);

    try {
      // Save the new unit
      const newUnit = await this.unitRepository.save(unit);
      return jsend.success(newUnit);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message:
            'An unexpected error occurred while creating the unit. Please try again later.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const units = await this.unitRepository.find();
    return jsend.success(units);
  }

  async findOne(id: number) {
    const unit = await this.findUnitByCondition({ id }, 'Unit not found');
    return jsend.success(unit);
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    const unit = await this.findUnitByCondition({ id }, 'Unit not found');

    Object.assign(unit, updateUnitDto);

    try {
      const updatedUnit = await this.unitRepository.save(unit);
      return jsend.success(updatedUnit);
    } catch (err) {
      throw new HttpException(
        jsend.error({
          message:
            'An unexpected error occurred while updating the unit. Please try again later.',
          data: err,
        }),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    const unit = await this.findUnitByCondition({ id }, 'Unit not found');
    await this.unitRepository.delete({ id });
    return jsend.success(unit);
  }

  private async findUnitByCondition(condition: object, errorMessage: string) {
    const unit = await this.unitRepository.findOne({ where: condition });
    if (!unit) {
      throw new NotFoundException(jsend.fail({ message: errorMessage }));
    }
    return unit;
  }
}