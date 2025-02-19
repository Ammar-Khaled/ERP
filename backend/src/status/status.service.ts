import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    return this.statusRepository.find();
  }

  async findOne(id: number) {
    const status = await this.statusRepository.findOneBy({statusId: id});
    if (!status) throw new NotFoundException({ message: `No status with ID of "${id}"!`}); 
    return status;
  }

  async findOneByName(name: string) {
    const status = await this.statusRepository.findOneBy({statusName: name});
    if (!status) throw new NotFoundException({ message: `No status with name of "${name}"!`}); 
    return status;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    return `This action updates a #${id} status`;
  }

  async remove(id: number) {
    return `This action removes a #${id} status`;
  }
}
