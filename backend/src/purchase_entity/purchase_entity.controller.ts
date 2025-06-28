import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PurchaseEntityService } from './purchase_entity.service';
import { CreatePurchaseEntityDto } from './dto/create-purchase_entity.dto';
import { UpdatePurchaseEntityDto } from './dto/update-purchase_entity.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('purchase-entities')
export class PurchaseEntitiesController {
  constructor(private readonly purchaseEntityService: PurchaseEntityService) {}

  @Post('create')
  create(@Body() createPurchaseEntityDto: CreatePurchaseEntityDto) {
    return this.purchaseEntityService.create(createPurchaseEntityDto);
  }

  @Get('find-all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.purchaseEntityService.findAll(paginationDto);
  }

  @Get('find-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.purchaseEntityService.findOne(+id);
  }

  @Get('find-by-name/:name')
  findOneByName(@Param('name') name: string) {
    return this.purchaseEntityService.findOneByName(name);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseEntityDto: UpdatePurchaseEntityDto,
  ) {
    return this.purchaseEntityService.update(+id, updatePurchaseEntityDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.purchaseEntityService.remove(+id);
  }
}
