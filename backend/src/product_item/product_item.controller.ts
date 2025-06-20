import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { ProductItemService } from './product_item.service';
import { CreateProductItemDto } from './dto/create-product_item.dto';
import { UpdateProductItemDto } from './dto/update-product_item.dto';
import { UpdateDamagedDto } from './dto/update-damaged.dto';

@Controller('product-item')
export class ProductItemController {
  constructor(private readonly productItemService: ProductItemService) {}

  @Post()
  create(@Body() createProductItemDto: CreateProductItemDto) {
    return this.productItemService.create(createProductItemDto);
  }

  @Get()
  findAll() {
    return this.productItemService.findAll();
  }

  @Get('/damaged')
  getDamaged() {
    return this.productItemService.getDamaged();
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
