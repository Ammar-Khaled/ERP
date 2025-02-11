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

  @Get(':id') // the colon ":" is a placeholder, indicating a dynamic value provided in the url
  findOne(@Param('id') id: string) {
    return this.purchaseEntityService.findOne(+id);
  }

  @Get('find-by-name/:name')
  findOneByName(@Param('name') name: string) {
    return this.purchaseEntityService.findOneByName(name);
  }

  @Patch('update/:name')
  update(@Param('name') name: string, @Body() updatePurchaseEntityDto: UpdatePurchaseEntityDto) {
    return this.purchaseEntityService.update(name, updatePurchaseEntityDto);
  }

  @Delete('delete/:name')
  remove(@Param('name') name: string) {
    return this.purchaseEntityService.remove(name);
  }
}
