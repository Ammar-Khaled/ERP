import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto, @Req() request: any) {
    const branchId = request.branchId;
    if (+branchId != createInventoryDto.branchId) {
      throw new ConflictException(
        'Can not create inventory outside your branch',
      );
    }
    return this.inventoriesService.create(createInventoryDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Req() request: any) {
    const branchId = request.branchId;
    return await this.inventoriesService.findAll(paginationDto, +branchId);
  }

  @Get(':id')
  findOneById(@Param('id') id: string, @Req() request: any) {
    const branchId = request.branchId;
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
  remove(@Param('id') id: string, @Req() request: any) {
    const branchId = request.branchId;
    return this.inventoriesService.remove(+id, +branchId);
  }
}
