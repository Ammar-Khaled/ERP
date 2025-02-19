import { Inject, Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './entities/status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatusService {
  constructor(
    @Inject('STATUS_REPOSITORY') private statusRepository: Repository<Status>,
  ) {}

  async create(createStatusDto: CreateStatusDto) {
    const newStatus = this.statusRepository.create(createStatusDto);
    return await this.statusRepository.save(newStatus);
  }

  async findAll() {
    return `This action returns all status`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} status`;
  }

  async findOneByName(name: string) {
    return `This action returns a #${name} status`;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    return `This action updates a #${id} status`;
  }

  async remove(id: number) {
    return `This action removes a #${id} status`;
  }
}
