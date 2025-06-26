import { Injectable } from '@nestjs/common';
import { CreateReturnPurchaseDto } from './dto/create-return_purchase.dto';
import { UpdateReturnPurchaseDto } from './dto/update-return_purchase.dto';

@Injectable()
export class ReturnPurchaseService {
  create(createReturnPurchaseDto: CreateReturnPurchaseDto) {
    return 'This action adds a new returnPurchase';
  }

  findAll() {
    return `This action returns all returnPurchase`;
  }

  findOne(id: number) {
    return `This action returns a #${id} returnPurchase`;
  }

  update(id: number, updateReturnPurchaseDto: UpdateReturnPurchaseDto) {
    return `This action updates a #${id} returnPurchase`;
  }

  remove(id: number) {
    return `This action removes a #${id} returnPurchase`;
  }
}
