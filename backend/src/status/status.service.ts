import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './entities/status.entity';
import { Repository } from 'typeorm';
import { StatusSeeder } from './status.seeder';

@Injectable()
export class StatusService implements OnModuleInit {
  constructor(
    @Inject('STATUS_REPOSITORY') private statusRepository: Repository<Status>,
    private statusSeeder: StatusSeeder,
  ) {}

  async onModuleInit() {
    await this.statusSeeder.seed();
  }

  async create(createStatusDto: CreateStatusDto) {
    const newStatus = this.statusRepository.create(createStatusDto);
    return await this.statusRepository.save(newStatus);
  }

  async findAll() {
    return this.statusRepository.find();
  }

  async findOne(id: number) {
    const status = await this.statusRepository.findOne({
      where: { id },
      relations: ['purchaseRequests'],
    });
    if (!status)
      throw new NotFoundException({ message: `No status with ID of (${id})!` });

    const purchaseRequestIds = status.purchaseRequests.map(
      (purchaseRequest) => purchaseRequest.id,
    );
    delete status.purchaseRequests;
    return { ...status, purchaseRequestIds };
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
