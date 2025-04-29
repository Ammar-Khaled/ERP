import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreatePurchaseRequestDto } from './dto/create-purchase_request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase_request.dto';
import { config } from 'dotenv';
import { PurchaseRequest } from './entities/purchase_request.entity';
import { User } from 'src/users/entities/user.entity';
import { Branch } from 'src/branches/entities/branch.entity';
import { Supplier } from 'src/suppliers/entities/supplier.entity';
import { Status } from 'src/status/entities/status.entity';
import { Currency } from 'src/currency/entities/currency.entity';
import { CreatePurchaseItemDto } from 'src/purchase_item/dto/create-purchase_item.dto';
import { PurchaseItemService } from 'src/purchase_item/purchase_item.service';

config();

@Injectable()
export class PurchaseRequestService {
  constructor(
    @Inject('PURCHASE_REQUEST_REPOSITORY')
    private purchaseRequestRepository: Repository<PurchaseRequest>,
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('BRANCH_REPOSITORY') private branchRepository: Repository<Branch>,
    @Inject('SUPPLIER_REPOSITORY')
    private supplierRepository: Repository<Supplier>,
    @Inject('STATUS_REPOSITORY') private statusRepository: Repository<Status>,
    @Inject('CURRENCY_REPOSITORY')
    private currencyRepository: Repository<Currency>,
    private readonly purchaseItemService: PurchaseItemService,
  ) {}

  async create(createPurchaseRequestDto: CreatePurchaseRequestDto) {
    const newPurchaseRequest = new PurchaseRequest();
    newPurchaseRequest.date = createPurchaseRequestDto.date || new Date();

    // Handle the user
    const user = await this.userRepository.findOneBy({
      id: createPurchaseRequestDto.userId,
    });
    if (!user)
      throw new NotFoundException({ message: `This user is not found!` });
    newPurchaseRequest.user = user;

    // Handle the branch
    const branch = await this.branchRepository.findOneBy({
      id: createPurchaseRequestDto.branchId,
    });
    if (!branch)
      throw new NotFoundException({
        message: `This branch is not found!`,
      });
    newPurchaseRequest.branch = branch;

    // Handle the supplier
    const supplier = await this.supplierRepository.findOneBy({
      id: createPurchaseRequestDto.supplierId,
    });
    if (!supplier)
      throw new NotFoundException({
        message: `This supplier is not found!`,
      });
    newPurchaseRequest.supplier = supplier;

    // Handle the status
    const status = await this.statusRepository.findOneBy({
      id: createPurchaseRequestDto.statusId,
    });
    if (!status)
      throw new NotFoundException({
        message: `This status is not found!`,
      });
    newPurchaseRequest.status = status;

    // Handle the currency
    const currency = await this.currencyRepository.findOneBy({
      id: createPurchaseRequestDto.currencyId,
    });
    if (!currency)
      throw new NotFoundException({
        message: `This currency is not found!`,
      });
    newPurchaseRequest.currency = currency;

    // Handle the array of purchase items
    // Ensuring the items are unique based on the name of the purchase entity in the final result
    // by incrementing the quantity if found duplicated items
    const purchaseItemsDtos = createPurchaseRequestDto.purchaseItemsDtos;
    const uniquePurchaseItemsDtos = purchaseItemsDtos.reduce(
      (visited, item) => {
        const existingItem = visited.find(
          (i) => i.purchaseEntityName === item.purchaseEntityName,
        );
        if (existingItem) existingItem.number_of_items += item.number_of_items;
        else visited.push(item);

        return visited;
      },
      [] as CreatePurchaseItemDto[],
    );

    // link between purchase item and purchase request
    const purchaseItems = [];
    for (const itemDto of uniquePurchaseItemsDtos) {
      const purchaseItem = await this.purchaseItemService.create(itemDto);
      purchaseItems.push(purchaseItem);
    }
    newPurchaseRequest.purchaseItems = purchaseItems;

    // Log and save
    return await this.purchaseRequestRepository.save(newPurchaseRequest);
  }

  async findAll() {
    return await this.purchaseRequestRepository.find();
  }

  async findOne(id: number) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id },
      relations: ['purchaseItems'],
    });

    if (!purchaseRequest)
      throw new NotFoundException(`No purchase request with ID of (${id})!`);

    return purchaseRequest;
  }

  async update(id: number, updatePurchaseRequestDto: UpdatePurchaseRequestDto) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id },
      relations: ['purchaseItems'],
    });

    if (!purchaseRequest) {
      throw new NotFoundException(`No purchase request with ID of (${id})!`);
    }

    // Update related entities if necessary
    if (updatePurchaseRequestDto.userId) {
      const user = await this.userRepository.findOneBy({
        id: updatePurchaseRequestDto.userId,
      });
      if (!user) throw new NotFoundException(`This username is not found!`);
      purchaseRequest.user = user;
    }

    if (updatePurchaseRequestDto.branchId) {
      const branch = await this.branchRepository.findOneBy({
        id: updatePurchaseRequestDto.branchId,
      });
      if (!branch)
        throw new NotFoundException({
          message: `This branch name is not found!`,
        });
      purchaseRequest.branch = branch;
    }

    if (updatePurchaseRequestDto.supplierId) {
      const supplier = await this.supplierRepository.findOneBy({
        id: updatePurchaseRequestDto.supplierId,
      });
      if (!supplier)
        throw new NotFoundException({
          message: `This supplier name is not found!`,
        });
      purchaseRequest.supplier = supplier;
    }

    if (updatePurchaseRequestDto.statusId) {
      const status = await this.statusRepository.findOneBy({
        id: updatePurchaseRequestDto.statusId,
      });
      if (!status)
        throw new NotFoundException({
          message: `This status name is not found!`,
        });
      purchaseRequest.status = status;
    }

    if (updatePurchaseRequestDto.currencyId) {
      const currency = await this.currencyRepository.findOneBy({
        id: updatePurchaseRequestDto.currencyId,
      });
      if (!currency)
        throw new NotFoundException({
          message: `This currency name is not found!`,
        });
      purchaseRequest.currency = currency;
    }

    // TODO: don't repeat the same code in `create`

    if (updatePurchaseRequestDto.purchaseItemsDtos) {
      const purchaseItemsDtos = updatePurchaseRequestDto.purchaseItemsDtos;
      const uniquePurchaseItemsDtos = purchaseItemsDtos.reduce(
        (visited, item) => {
          const existingItem = visited.find(
            (i) => i.purchaseEntityName === item.purchaseEntityName,
          );
          if (existingItem)
            existingItem.number_of_items += item.number_of_items;
          else visited.push(item);

          return visited;
        },
        [] as CreatePurchaseItemDto[],
      );

      const purchaseItems = [];
      for (const itemDto of uniquePurchaseItemsDtos) {
        const purchaseItem = await this.purchaseItemService.create(itemDto);
        purchaseItems.push(purchaseItem);
      }

      purchaseRequest.purchaseItems = purchaseItems;
    }

    try {
      Object.assign(purchaseRequest, updatePurchaseRequestDto);
      // console.log(purchaseRequest); // debug
      await this.purchaseRequestRepository.save(purchaseRequest);

      console.log(`Updated purchase request with ID: ${id} successfully!`);
      return purchaseRequest;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  async remove(id: number) {
    const purchaseRequest = await this.findOne(id);
    await this.purchaseRequestRepository.softDelete({ id });

    console.log(`Removed purchase request with ID: ${id} successfully!`);
    return purchaseRequest;
  }
}
