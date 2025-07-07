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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req) {
    return this.categoriesService.create(createCategoryDto, req.user.branchId);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Req() req) {
    return await this.categoriesService.findAll(
      paginationDto,
      req.user.branchId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.categoriesService.findOne(+id, req.user.branchId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.categoriesService.remove(+id, req.user.branchId);
  }
}
