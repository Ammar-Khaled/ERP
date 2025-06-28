import { Repository, FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export abstract class BaseService<T> {
  constructor(protected repository: Repository<T>) {}

  protected addBranchFilter(options: FindManyOptions<T> | FindOneOptions<T>, branchId?: number): void {
    if (branchId) {
      options.where = {
        ...options.where,
        branch_id: branchId,
      };
    }
  }

  async findAll(paginationDto: PaginationDto, branchId?: number): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const options: FindManyOptions<T> = {
      skip,
      take: limit,
    };

    this.addBranchFilter(options, branchId);

    const [data, total] = await this.repository.findAndCount(options);
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

  async findOne(id: number, relations?: string[], branchId?: number): Promise<T> {
    const options: FindOneOptions<T> = {
      where: { id } as any,
      relations,
    };

    this.addBranchFilter(options, branchId);

    const entity = await this.repository.findOne(options);
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    return entity;
  }

  async create(createDto: DeepPartial<T>, branchId?: number): Promise<T> {
    if (branchId) {
      (createDto as any).branch_id = branchId;
    }

    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async update(id: number, updateDto: DeepPartial<T>, branchId?: number): Promise<T> {
    const entity = await this.findOne(id, [], branchId);
    Object.assign(entity, updateDto);
    return this.repository.save(entity);
  }

  async remove(id: number, branchId?: number): Promise<void> {
    const entity = await this.findOne(id, [], branchId);
    await this.repository.softDelete(id);
  }
}