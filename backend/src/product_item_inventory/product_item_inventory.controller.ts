import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductItemInventoryService } from './product_item_inventory.service';
import { CreateProductItemInventoryDto } from './dto/create-product_item_inventory.dto';
import { UpdateProductItemInventoryDto } from './dto/update-product_item_inventory.dto';
import { Public } from 'src/auth/auth.guard';
@Controller('product-item-inventory')
export class ProductItemInventoryController {
  constructor(private readonly productItemInventoryService: ProductItemInventoryService) {}
  @Public()
  @Post()
  create(@Body() createProductItemInventoryDto: CreateProductItemInventoryDto) {
    return this.productItemInventoryService.create(createProductItemInventoryDto);
  }
  @Public()
  @Get()
  findAll() {
    return this.productItemInventoryService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productItemInventoryService.findOne(+id);
  }
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductItemInventoryDto: UpdateProductItemInventoryDto) {
    return this.productItemInventoryService.update(+id, updateProductItemInventoryDto);
  }
  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productItemInventoryService.remove(+id);
  }
}
