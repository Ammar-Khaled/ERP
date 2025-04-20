import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreatePurchaseEntityDto } from './dto/create-purchase_entity.dto';
import { UpdatePurchaseEntityDto } from './dto/update-purchase_entity.dto';
import { PurchaseEntity } from './entities/purchase_entity.entity';
import { config } from 'dotenv';

config();

@Injectable()
export class PurchaseEntityService {
  constructor(
    @Inject('PURCHASE_ENTITY_REPOSITORY')
    private purchaseEntityRepository: Repository<PurchaseEntity>,
  ) {}

  async create(createPurchaseEntityDto: CreatePurchaseEntityDto) {
    const existedEntity = await this.purchaseEntityRepository.findOneBy({
      name: createPurchaseEntityDto.name,
    });
    if (existedEntity)
      throw new ConflictException(
        `Purchase entity with name "${createPurchaseEntityDto.name}" already existed.`,
      );

    const newPurchase = this.purchaseEntityRepository.create(
      createPurchaseEntityDto,
    );
    console.log(`Created a purchase entity successfully!`);
    return await this.purchaseEntityRepository.save(newPurchase);
  }

  async findAll() {
    return await this.purchaseEntityRepository.find();
  }

  async findOne(id: number) {
    const purchaseEntity = await this.purchaseEntityRepository.findOneBy({
      id,
    });
    if (!purchaseEntity)
      throw new NotFoundException(
        `There is no purchase entity with id of ${id}!`,
      );
    return purchaseEntity;
  }

  async findOneByName(name: string) {
    const purchaseEntity = await this.purchaseEntityRepository.findOne({
      where: { name },
    });
    if (!purchaseEntity)
      throw new NotFoundException(
        `There is no purchase entity named "${name}"!`,
      );
    return purchaseEntity;
  }

  async update(id: number, updatePurchaseEntityDto: UpdatePurchaseEntityDto) {
    const purchaseEntity = await this.findOne(id);
    Object.assign(purchaseEntity, updatePurchaseEntityDto);

    console.log(`Updated the purchase entity with id of ${id} successfully!`);
    return await this.purchaseEntityRepository.save(purchaseEntity);
  }

  async remove(id: number) {
    const purchaseEntity = await this.findOne(id);
    await this.purchaseEntityRepository.softDelete({ id });

    console.log(`Removed the purchase entity with id of ${id} successfully!`);
    return purchaseEntity;
  }
}
