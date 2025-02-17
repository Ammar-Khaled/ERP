import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PurchaseItemService } from './purchase_item.service';
import { CreatePurchaseItemDto } from './dto/create-purchase_item.dto';
import { UpdatePurchaseItemDto } from './dto/update-purchase_item.dto';

@Controller('purchase-items')
export class PurchaseItemController {
  constructor(private readonly purchaseItemService: PurchaseItemService) {}

  @Post('create')
  create(@Body() createPurchaseItemDto: CreatePurchaseItemDto) {
    return this.purchaseItemService.create(createPurchaseItemDto);
  }

  @Get('find-all')
  findAll() {
    return this.purchaseItemService.findAll();
  }

  @Get('find-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.purchaseItemService.findOne(+id);
  }

  @Get('find-by-name/:name')
  findOneByName(@Param('name') name: string) {
    return this.purchaseItemService.findOneByName(name);
  }

  @Patch('update/:name')
  update(
    @Param('name') name: string,
    @Body() updatePurchaseItemDto: UpdatePurchaseItemDto,
  ) {
    return this.purchaseItemService.update(name, updatePurchaseItemDto);
  }

  @Delete('delete/:name')
  remove(@Param('name') name: string) {
    return this.purchaseItemService.remove(name);
  }
}
