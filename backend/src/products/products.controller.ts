import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req) {
    return this.productsService.create(createProductDto, req.user.branchId);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() req) {
    return this.productsService.findAll(paginationDto, req.user.branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.productsService.findOne(+id, req.user.branchId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.productsService.remove(+id, req.user.branchId);
  }
}
