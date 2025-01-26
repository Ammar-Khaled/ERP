import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductItemService } from './product_item.service';
import { CreateProductItemDto } from './dto/create-product_item.dto';
import { UpdateProductItemDto } from './dto/update-product_item.dto';
import { Public } from 'src/auth/auth.guard';
@Controller('product-item')
export class ProductItemController {
  constructor(private readonly productItemService: ProductItemService) {}
  @Public()
  @Post()
  create(@Body() createProductItemDto: CreateProductItemDto) {
    return this.productItemService.create(createProductItemDto);
  }
  @Public()
  @Get()
  findAll() {
    return this.productItemService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productItemService.findOne(+id);
  }
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductItemDto: UpdateProductItemDto) {
    return this.productItemService.update(+id, updateProductItemDto);
  }
  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productItemService.remove(+id);
  }
}
