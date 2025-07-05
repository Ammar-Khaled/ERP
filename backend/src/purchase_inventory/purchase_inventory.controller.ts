import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PurchaseInventoryService } from './purchase_inventory.service';
import { CreatePurchaseInventoryDto } from './dto/create-purchase_inventory.dto';

@Controller('purchase-inventory')
export class PurchaseInventoryController {
  private purchaseInventoryService: PurchaseInventoryService;
  @Get()
  findAll() {
    return this.purchaseInventoryService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.purchaseInventoryService.findOneById(+id);
  }

  @Get('/purchase/:purchaseEntityId')
  findByPurchase(@Param('purchaseEntityId') purchaseEntityId: string) {
    return this.purchaseInventoryService.findByPurchase(+purchaseEntityId);
  }

  @Post('create')
  create(@Body() createPurchaseInventoryDto: CreatePurchaseInventoryDto) {
    return this.purchaseInventoryService.create(createPurchaseInventoryDto);
  }
}
