import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { ReturnPurchaseItem } from "./entities/return_purchase_item.entity";
import { PurchaseItem } from "src/purchase_request/entities/purchase_item.entity";
import { CreateReturnPurchaseItemDto } from "./dto/create-return_purchase_item.dto";
import { UpdateReturnPurchaseItemDto } from "./dto/update-return_purchase_item.dto";

@Injectable()
export class ReturnPurchaseItemService {
    constructor(
        @Inject('RETURN_PURCHASE_ITEM_REPOSITORY')
        private readonly returnPurchaseItemRepo: Repository<ReturnPurchaseItem>,
        @Inject('PURCHASE_ITEM_REPOSITORY')
        private readonly purchaseItemRepo: Repository<PurchaseItem>
    ) { }

    async create(returnPurchaseItemDto: CreateReturnPurchaseItemDto): Promise<ReturnPurchaseItem> {
        // Nice Feature: use the transaction approach to ensure ATOMICITY
        // Any operation with the database will be done through the transactional manager
        return this.returnPurchaseItemRepo.manager.transaction(async (transactionalEntityManager) => {
            // Validate purchase item id
            const purchaseItem = await transactionalEntityManager.findOne(PurchaseItem, {
                where: { id: returnPurchaseItemDto.purchaseItemId },
            });
            if (!purchaseItem) {
                throw new NotFoundException(`Purchase item with id ${returnPurchaseItemDto.purchaseItemId} not found`);
            }

            // Validate the number of returned
            if (returnPurchaseItemDto.numberOfReturned > purchaseItem.numberOfItems) {
                throw new ConflictException(`Cannot return more items than available. Available: ${purchaseItem.numberOfItems}, Attempted: ${returnPurchaseItemDto.numberOfReturned}`);
            }
            // Valid? => Update the number of items in the purchase item
            purchaseItem.numberOfItems -= returnPurchaseItemDto.numberOfReturned;
            await transactionalEntityManager.save(PurchaseItem, purchaseItem);

            // Calculate the returned money
            const returnedMoney = purchaseItem.purchaseEntity.unitPrice * returnPurchaseItemDto.numberOfReturned;

            // Create, save, and return
            const returnPurchaseItem = await transactionalEntityManager.create(ReturnPurchaseItem, returnPurchaseItemDto);
            returnPurchaseItem.returnedMoney = returnedMoney;
            return await transactionalEntityManager.save(ReturnPurchaseItem, returnPurchaseItem);
        });
    }

    async findAll(): Promise<ReturnPurchaseItem[]> {
        return await this.returnPurchaseItemRepo.find();
    }

    async findOne(id: number): Promise<ReturnPurchaseItem> {
        const returnPurchaseItem = await this.returnPurchaseItemRepo.findOne({ where: { id } });
        if (!returnPurchaseItem) {
            throw new NotFoundException(`Return purchase item with id ${id} not found`);
        }
        return returnPurchaseItem;
    }

    async update(id: number, updateReturnPurchaseItemDto: UpdateReturnPurchaseItemDto): Promise<ReturnPurchaseItem> {
        return this.returnPurchaseItemRepo.manager.transaction(async (transactionalEntityManager) => {
            // Validate the existence of the return purchase item
            const returnPurchaseItem = await this.findOne(id);
            if (!returnPurchaseItem) {
                throw new NotFoundException(`Return purchase item with id ${id} not found`);
            }

            // Validate the new number of returned
            const purchaseItem = await transactionalEntityManager.findOne(PurchaseItem, {
                where: { id: returnPurchaseItem.purchaseItemId },
            });
            const difference = updateReturnPurchaseItemDto.numberOfReturned - returnPurchaseItem.numberOfReturned;
            if (difference > purchaseItem.numberOfItems) {
                throw new ConflictException(`Cannot return more items than available. Available: ${purchaseItem.numberOfItems}, Attempted: ${updateReturnPurchaseItemDto.numberOfReturned}`);
            }

            // Update the purchase item and save it
            purchaseItem.numberOfItems -= difference;
            await transactionalEntityManager.save(PurchaseItem, purchaseItem);

            // Finally, update our entity
            returnPurchaseItem.numberOfReturned = updateReturnPurchaseItemDto.numberOfReturned;
            await transactionalEntityManager.save(ReturnPurchaseItem, returnPurchaseItem);
            return returnPurchaseItem;
        })
    }

    async remove(id: number): Promise<ReturnPurchaseItem> {
        return this.returnPurchaseItemRepo.manager.transaction(async (transactionalEntityManager) => {
            // Check for the existence
            const returnPurchaseItem = await this.findOne(id);
            if (!returnPurchaseItem) {
                throw new NotFoundException(`Return purchase item with id ${id} not found`);
            }

            // Update the purchase item number of items
            const purchaseItem = await transactionalEntityManager.findOne(PurchaseItem, {
                where: { id: returnPurchaseItem.purchaseItemId },
            });
            if (!purchaseItem) {
                throw new NotFoundException(`Purchase item with id ${returnPurchaseItem.purchaseItemId} not found`);
            }
            purchaseItem.numberOfItems += returnPurchaseItem.numberOfReturned;
            await transactionalEntityManager.save(PurchaseItem, purchaseItem);

            await transactionalEntityManager.softDelete(ReturnPurchaseItem, returnPurchaseItem.id);
            return returnPurchaseItem;
        });
    }
}