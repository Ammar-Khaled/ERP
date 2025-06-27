import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { ProductItemService } from './product_item.service';
import { CreateProductItemDto } from './dto/create-product_item.dto';
import { UpdateProductItemDto } from './dto/update-product_item.dto';
import { UpdateDamagedDto } from './dto/update-damaged.dto';
import { UpdateExpiredDto } from './dto/update-expired.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('product-item')
export class ProductItemController {
  constructor(private readonly productItemService: ProductItemService) {}

  @Post()
  create(@Body() createProductItemDto: CreateProductItemDto) {
    return this.productItemService.create(createProductItemDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.productItemService.findAll(paginationDto);
  }

  @Get('/damaged')
  getDamaged() {
    return this.productItemService.getDamaged();
  }

  @Post('/check-expired')
  @HttpCode(200)
  checkExpiredProducts() {
    return this.productItemService.checkExpiredProducts();
  }

  @Patch('/mark-expired')
  markProductsAsExpired(@Body() updateExpiredDto: UpdateExpiredDto) {
    return this.productItemService.markProductsAsExpired(updateExpiredDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productItemService.findOne(+id);
  }

  @Patch('/add-damaged')
  updateDamaged(@Body() updateDamagedDto: UpdateDamagedDto) {
    return this.productItemService.updateDamaged(updateDamagedDto);
  }
  @Patch(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productItemService.uploadImage(+id, file, 'main');
  }

  @Patch(':id/upload-images')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productItemService.uploadImages(+id, files);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductItemDto: UpdateProductItemDto,
  ) {
    return this.productItemService.update(+id, updateProductItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productItemService.remove(+id);
  }
}
