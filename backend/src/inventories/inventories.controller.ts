import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { TransferProductItemsDto } from './dto/transfer-product-items.dto';

@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoriesService.create(createInventoryDto);
  }

  @Get()
  findAll() {
    return this.inventoriesService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.inventoriesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoriesService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoriesService.remove(+id);
  }

  @Post('transfer')
  async transferProducts(
    @Body() transferProductItemsDto: TransferProductItemsDto,
  ) {
    return this.inventoriesService.transferProductItems(
      transferProductItemsDto,
    );
  }
}
