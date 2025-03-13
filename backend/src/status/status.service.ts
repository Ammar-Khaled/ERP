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
    const status = await this.statusRepository.findOneBy({ id });
    if (!status)
      throw new NotFoundException({ message: `No status with ID of (${id})!` });
    return status;
  }

  async findOneByName(name: string) {
    const status = await this.statusRepository.findOneBy({ name });
    if (!status)
      throw new NotFoundException({
        message: `No status with name of "${name}"!`,
      });
    return status;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    const status = await this.findOne(id);
    Object.assign(status, updateStatusDto);

    console.log(`Update status with id: ${id} successfully!`);
    return await this.statusRepository.save(status);
  }

  async remove(id: number) {
    const status = await this.findOne(id);
    await this.statusRepository.softDelete({ id });
    
    console.log(`Delete status with id: (${id}) successfully!`);
    return status;
  }
}
