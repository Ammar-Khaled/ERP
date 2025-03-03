import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PurchaseRequestService } from './purchase_request.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase_request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase_request.dto';

@Controller('purchase-requests')
export class PurchaseRequestController {
  constructor(
    private readonly purchaseRequestService: PurchaseRequestService,
  ) {}

  @Post('create')
  create(@Body() createPurchaseRequestDto: CreatePurchaseRequestDto) {
    return this.purchaseRequestService.create(createPurchaseRequestDto);
  }

  @Get('find-all')
  findAll() {
    return this.purchaseRequestService.findAll();
  }

  @Get('find-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.purchaseRequestService.findOne(+id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseRequestDto: UpdatePurchaseRequestDto,
  ) {
    return this.purchaseRequestService.update(+id, updatePurchaseRequestDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.purchaseRequestService.remove(+id);
  }
}
