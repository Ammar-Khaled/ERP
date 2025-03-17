import { Injectable } from '@nestjs/common';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { Return } from './entities/return.entity';

@Injectable()
export class ReturnService {
  create(createReturnDto: CreateReturnDto) {
    const newReturn = new Return();

    newReturn.date = createReturnDto.date || new Date();
    if (createReturnDto.reason) {
      newReturn.reason = createReturnDto.reason;
    }

    
  }

  findAll() {
    return `This action returns all return`;
  }

  findOne(id: number) {
    return `This action returns a #${id} return`;
  }

  update(id: number, updateReturnDto: UpdateReturnDto) {
    return `This action updates a #${id} return`;
  }

  remove(id: number) {
    return `This action removes a #${id} return`;
  }
}
