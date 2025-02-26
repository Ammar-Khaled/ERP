import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VariationOptionService } from './variation_option.service';
import { CreateVariationOptionDto } from './dto/create-variation_option.dto';
import { UpdateVariationOptionDto } from './dto/update-variation_option.dto';
import { Public } from 'src/auth/auth.guard';

@Controller('variation-option')
export class VariationOptionController {
  constructor(private readonly variationOptionService: VariationOptionService) {}
  @Public()
  @Post()
  create(@Body() createVariationOptionDto: CreateVariationOptionDto) {
    return this.variationOptionService.create(createVariationOptionDto);
  }
  @Public()
  @Get()
  findAll() {
    return this.variationOptionService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variationOptionService.findOne(+id);
  }
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVariationOptionDto: UpdateVariationOptionDto) {
    return this.variationOptionService.update(+id, updateVariationOptionDto);
  }
  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variationOptionService.remove(+id);
  }
}
