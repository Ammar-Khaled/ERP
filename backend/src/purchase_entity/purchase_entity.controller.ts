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
import { PurchaseEntityService } from './purchase_entity.service';
import { CreatePurchaseEntityDto } from './dto/create-purchase_entity.dto';
import { UpdatePurchaseEntityDto } from './dto/update-purchase_entity.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('purchase-entities')
export class PurchaseEntitiesController {
  constructor(private readonly purchaseEntityService: PurchaseEntityService) {}

  @Post('create')
  create(@Body() createPurchaseEntityDto: CreatePurchaseEntityDto, @Req() req) {
    return this.purchaseEntityService.create(
      createPurchaseEntityDto,
      req.user.branchId,
    );
  }

  @Get('find-all')
  async findAll(@Query() paginationDto: PaginationDto, @Req() req) {
    return await this.purchaseEntityService.findAll(
      paginationDto,
      req.user.branchId,
    );
  }

  @Get('find-by-id/:id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.purchaseEntityService.findOne(+id, req.user.branchId);
  }

  @Get('find-by-name/:name')
  findOneByName(@Param('name') name: string, @Req() req) {
    return this.purchaseEntityService.findOneByName(name, req.user.branchId);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseEntityDto: UpdatePurchaseEntityDto,
  ) {
    return this.purchaseEntityService.update(+id, updatePurchaseEntityDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() req) {
    return this.purchaseEntityService.remove(+id, req.user.branchId);
  }
}
