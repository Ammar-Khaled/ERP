import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseItemDto } from './dto/create-purchase_item.dto';
import { UpdatePurchaseItemDto } from './dto/update-purchase_item.dto';
import { config } from 'dotenv';
import { PurchaseItem } from './entities/purchase_item.entity';
import { Repository } from 'typeorm';
import { PurchaseEntity } from 'src/purchase_entity/entities/purchase_entity.entity';
import { PurchaseEntityService } from 'src/purchase_entity/purchase_entity.service';
import { CreatePurchaseEntityDto } from 'src/purchase_entity/dto/create-purchase_entity.dto';

config();

@Injectable()
export class PurchaseItemService {
  constructor(
    private readonly purchaseEntityService: PurchaseEntityService,
    @Inject('PURCHASE_ITEM_REPOSITORY') private purchaseItemRepository: Repository<PurchaseItem>,
    @Inject('PURCHASE_ENTITY_REPOSITORY') private purchaseEntityRepository:
      Repository<PurchaseEntity>
  ) { }

  async create(createPurchaseItemDto: CreatePurchaseItemDto) {
    // Ensure there is a purchase entity with that name:
    const existedEntity = await this.purchaseEntityRepository.findOne({
      where: { name: createPurchaseItemDto.name },
    });

    if (!existedEntity) {
      // Create an entity, then take items from itself:
      const newEntityDto = new CreatePurchaseEntityDto();
      newEntityDto.name = createPurchaseItemDto.name;

      const newEntity = await this.purchaseEntityRepository.create(newEntityDto);
      await this.purchaseEntityRepository.save(newEntity);

      createPurchaseItemDto.purchaseEntity = newEntity;
    }

    // Create the item and save it:
    const newItem = await this.purchaseItemRepository.create(createPurchaseItemDto);
    console.log('Created purchase item successfully!');
    return await this.purchaseItemRepository.save(newItem);
  }

  async findAll() {
    return await this.purchaseItemRepository.find();
  }

  async findOne(id: number) {
    const item = await this.purchaseItemRepository.findOneBy({ id });
    if (!item) throw new NotFoundException(`There is no purchase item with id of ${id}!`);
    return item;
  }

  async findOneByName(name: string) {
    // # should I search here or inside the entity?!
    const item = await this.purchaseItemRepository.findOneBy({ name });
    if (!item) throw new NotFoundException(`There is no purchase item with that name!`);
    return item;
  }

  async update(name: string, updatePurchaseItemDto: UpdatePurchaseItemDto) {
    const item = await this.findOneByName(name);

    if (!item) {
      throw new NotFoundException(`Purchase item "${name}" not found.`);
    }

    Object.assign(item, updatePurchaseItemDto);
    console.log(`Updated purchase item "${name}" successfully!`);
    return await this.purchaseItemRepository.save(item);
  }

  async remove(name: string) {
    const item = await this.findOneByName(name);

    if (!item) {
      throw new NotFoundException(`Purchase item "${name}" not found.`);
    }

    await this.purchaseItemRepository.delete({ name });
    console.log(`Removed purchase item "${name}" successfully!`);
    return item;
  }
}
