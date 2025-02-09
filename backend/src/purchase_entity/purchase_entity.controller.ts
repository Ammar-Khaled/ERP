import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PurchaseEntityService } from './purchase_entity.service';
import { CreatePurchaseEntityDto } from './dto/create-purchase_entity.dto';
import { UpdatePurchaseEntityDto } from './dto/update-purchase_entity.dto';

@Controller('purchase-entities')
export class PurchaseEntityController {
  constructor(private readonly purchaseEntityService: PurchaseEntityService) {}

  @Post()
  create(@Body() createPurchaseEntityDto: CreatePurchaseEntityDto) {
    return this.purchaseEntityService.create(createPurchaseEntityDto);
  }

  @Get()
  findAll() {
    return this.purchaseEntityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseEntityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseEntityDto: UpdatePurchaseEntityDto) {
    return this.purchaseEntityService.update(+id, updatePurchaseEntityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseEntityService.remove(+id);
  }
}
