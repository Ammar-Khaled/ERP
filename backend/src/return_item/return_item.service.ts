import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReturnItemDto } from './dto/create-return_item.dto';
import { UpdateReturnItemDto } from './dto/update-return_item.dto';

@Injectable()
export class ReturnItemService {
  constructor(@Inject('RETURN_ITEM_REPOSITORY') private returnItemRepository) {}

  async create(createReturnItemDto: CreateReturnItemDto) {
    const existingReturnItem = await this.returnItemRepository.findOneBy({
      name: createReturnItemDto.name,
    });
    if (existingReturnItem) {
      throw new ConflictException(
        'A return item with this name already exists',
      );
    }

    const returnItem = this.returnItemRepository.create(createReturnItemDto);
    return await this.returnItemRepository.save(returnItem);
  }

  async findAll() {
    return await this.returnItemRepository.find();
  }

  async findOne(id: number) {
    const returnItem = await this.returnItemRepository.findOneBy({ id });
    if (!returnItem) {
      throw new NotFoundException(`Return item with id ${id} not found`);
    }

    return returnItem;
  }

  async update(id: number, updateReturnItemDto: UpdateReturnItemDto) {
    const returnItem = await this.findOne(id);
    Object.assign(returnItem, updateReturnItemDto);
    return await this.returnItemRepository.save(returnItem);
  }

  async remove(id: number) {
    const returnItem = await this.findOne(id);
    await this.returnItemRepository.softDelete({ id });
    return returnItem;
  }
}
