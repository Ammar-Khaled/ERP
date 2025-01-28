import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductItemInventoryService } from './product_item_inventory.service';
import { CreateProductItemInventoryDto } from './dto/create-product_item_inventory.dto';
import { UpdateProductItemInventoryDto } from './dto/update-product_item_inventory.dto';

@Controller('product-item-inventory')
export class ProductItemInventoryController {
  constructor(
    private readonly productItemInventoryService: ProductItemInventoryService,
  ) {}

  @Post()
  create(@Body() createProductItemInventoryDto: CreateProductItemInventoryDto) {
    return this.productItemInventoryService.create(
      createProductItemInventoryDto,
    );
  }

  @Get()
  findAll() {
    return this.productItemInventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productItemInventoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductItemInventoryDto: UpdateProductItemInventoryDto,
  ) {
    return this.productItemInventoryService.update(
      +id,
      updateProductItemInventoryDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productItemInventoryService.remove(+id);
  }
}
