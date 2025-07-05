import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PurchaseInventory } from './entities/purchase_inventory.entity';
import { CreatePurchaseInventoryDto } from './dto/create-purchase_inventory.dto';
import { Inventory } from '../inventories/entities/inventory.entity';
import { PurchaseEntity } from '../purchase_entity/entities/purchase_entity.entity';

@Injectable()
export class PurchaseInventoryService {
  constructor(
    @Inject('PURCHASE_INVENTORY_REPOSITORY')
    private readonly purchaseInventoryRepo: Repository<PurchaseInventory>,
    @Inject('INVENTORY_REPOSITORY')
    private readonly inventoryRepo: Repository<Inventory>,
    @Inject('PURCHASE_ENTITY_REPOSITORY')
    private readonly purchaseEntityRepo: Repository<PurchaseEntity>,
  ) {}

  async findAll() {
    return await this.purchaseInventoryRepo.find();
  }

  async findOneById(id: number) {
    return await this.purchaseInventoryRepo.findOneBy({ id });
  }

  async findByPurchase(purchaseEntityId: number) {
    return await this.purchaseInventoryRepo.find({
      where: { purchaseEntityId },
      relations: ['inventory'],
    });
  }

  async create(createPurchaseInventoryDto: CreatePurchaseInventoryDto) {
    const { inventoryId, purchaseEntityId } = createPurchaseInventoryDto;

    // Check if the inventory exists
    const inventory = await this.inventoryRepo.findOneBy({
      id: inventoryId,
    });
    if (!inventory) {
      throw new Error(`Inventory with ID ${inventoryId} does not exist.`);
    }

    // Check if the purchase entity exists
    const purchaseEntity = await this.purchaseEntityRepo.findOneBy({
      id: purchaseEntityId,
    });
    if (!purchaseEntity) {
      throw new Error(
        `Purchase entity with ID ${purchaseEntityId} does not exist.`,
      );
    }

    // check if the PurchaseInventory already exists
    const existingPurchaseInventory = await this.purchaseInventoryRepo.findOne({
      where: {
        inventoryId,
        purchaseEntityId,
      },
    });

    if (existingPurchaseInventory) {
      throw new ConflictException(
        `Purchase inventory for inventory ID ${inventoryId} and purchase entity ID ${purchaseEntityId} already exists. Please, consider updating it`,
      );
    } else {
      const purchaseInventory = this.purchaseInventoryRepo.create(
        createPurchaseInventoryDto,
      );

      // update the inventory amount
      inventory.totalNumberOfPurchaseEntities += purchaseInventory.amount;
      await this.inventoryRepo.save(inventory);
      // update the purchase entity amount
      purchaseEntity.totalAmount += purchaseInventory.amount;
      await this.purchaseEntityRepo.save(purchaseEntity);

      return await this.purchaseInventoryRepo.save(purchaseInventory);
    }
  }
}
