import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @Headers('branchId') branchId: string,
  ) {
    if (+branchId != createInventoryDto.branchId) {
      throw new ConflictException(
        'Can not create inventory outside your branch',
      );
    }
    return this.inventoriesService.create(createInventoryDto);
  }

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Headers('branchId') branchId: string,
  ) {
    return await this.inventoriesService.findAll(paginationDto, +branchId);
  }

  @Get(':id')
  findOneById(@Param('id') id: string, @Headers('branchId') branchId: string) {
    return this.inventoriesService.findOne(+id, +branchId, [
      'productItemToInventories',
    ]);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoriesService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('branchId') branchId: string) {
    return this.inventoriesService.remove(+id, +branchId);
  }
}
