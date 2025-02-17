import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PurchaseRequestService } from './purchase_request.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase_request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase_request.dto';

@Controller('purchase-request')
export class PurchaseRequestController {
  constructor(private readonly purchaseRequestService: PurchaseRequestService) {}

  @Post()
  create(@Body() createPurchaseRequestDto: CreatePurchaseRequestDto) {
    return this.purchaseRequestService.create(createPurchaseRequestDto);
  }

  @Get()
  findAll() {
    return this.purchaseRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchaseRequestDto: UpdatePurchaseRequestDto) {
    return this.purchaseRequestService.update(+id, updatePurchaseRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseRequestService.remove(+id);
  }
}
