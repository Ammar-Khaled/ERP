import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PurchaseInventory } from './entities/purchase_inventory.entity';

@Injectable()
export class PurchaseInventoryService {
  constructor(
    @Inject('PURCHASE_INVENTORY_REPOSITORY')
    private readonly purchaseInventoryRepo: Repository<PurchaseInventory>,
  ) {}

  async linkPurchaseRequestToInventory(purchaseRequestId: number, inventoryId: number) {
    const purchaseInventory = this.purchaseInventoryRepo.create({
      purchaseRequestId,
      inventoryId,
    });
    return await this.purchaseInventoryRepo.save(purchaseInventory);
  }

  async findByPurchaseRequestId(purchaseRequestId: number) {
    return await this.purchaseInventoryRepo.find({
      where: { purchaseRequestId },
      relations: ['inventory'],
    });
  }
}
