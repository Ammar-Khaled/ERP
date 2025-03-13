import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePurchaseItemDto } from './dto/create-purchase_item.dto';
import { UpdatePurchaseItemDto } from './dto/update-purchase_item.dto';
import { config } from 'dotenv';
import { PurchaseItem } from './entities/purchase_item.entity';
import { Repository } from 'typeorm';
import { PurchaseEntity } from 'src/purchase_entity/entities/purchase_entity.entity';

config();

@Injectable()
export class PurchaseItemService {
  constructor(
    @Inject('PURCHASE_ITEM_REPOSITORY')
    private purchaseItemRepository: Repository<PurchaseItem>,
    @Inject('PURCHASE_ENTITY_REPOSITORY')
    private purchaseEntityRepository: Repository<PurchaseEntity>,
  ) {}

  async create(createPurchaseItemDto: CreatePurchaseItemDto) {
    const newPurchaseItem = new PurchaseItem();

    // Check if the purchase entity name exists in the database:
    const existedEntity = await this.purchaseEntityRepository.findOne({
      where: { name: createPurchaseItemDto.purchaseEntityName },
    });
    if (!existedEntity) {
      throw new NotFoundException(
        `There is no purchase entity with name "${createPurchaseItemDto.purchaseEntityName}". Please create it first!`,
      );
    }

    newPurchaseItem.purchaseEntity = existedEntity;
    newPurchaseItem.number_of_items = createPurchaseItemDto.number_of_items;
    newPurchaseItem.discount = createPurchaseItemDto.discount || 0;

    // Create the item and save it:
    console.log('Created purchase item successfully!');
    return await this.purchaseItemRepository.save(newPurchaseItem);
  }

  async findAll() {
    return await this.purchaseItemRepository.find();
  }

  async findOne(id: number) {
    const item = await this.purchaseItemRepository.findOneBy({ id });
    if (!item)
      throw new NotFoundException(
        `There is no purchase item with id of ${id}!`,
      );
    return item;
  }

  async update(id: number, updatePurchaseItemDto: UpdatePurchaseItemDto) {
    const purchaseItem = await this.findOne(id);
    Object.assign(purchaseItem, updatePurchaseItemDto);

    console.log(`Updated purchase item "${id}" successfully!`);
    return await this.purchaseItemRepository.save(purchaseItem);
  }

  async remove(id: number) {
    const purchaseItem = await this.findOne(id);
    await this.purchaseItemRepository.softDelete({ id });
    
    console.log(`Removed purchase item "${id}" successfully!`);
    return purchaseItem;
  }
}
