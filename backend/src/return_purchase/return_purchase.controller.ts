import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReturnPurchaseService } from './return_purchase.service';
import { CreateReturnPurchaseDto } from './dto/create-return_purchase.dto';
import { UpdateReturnPurchaseDto } from './dto/update-return_purchase.dto';

@Controller('return-purchase')
export class ReturnPurchaseController {
  constructor(private readonly returnPurchaseService: ReturnPurchaseService) {}

  @Post()
  create(@Body() createReturnPurchaseDto: CreateReturnPurchaseDto) {
    return this.returnPurchaseService.create(createReturnPurchaseDto);
  }

  @Get()
  findAll() {
    return this.returnPurchaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.returnPurchaseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReturnPurchaseDto: UpdateReturnPurchaseDto) {
    return this.returnPurchaseService.update(+id, updateReturnPurchaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.returnPurchaseService.remove(+id);
  }
}
