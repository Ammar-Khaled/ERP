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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly supplierService: SuppliersService) {}

  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto, @Req() req) {
    return await this.supplierService.create(
      createSupplierDto,
      req.tokenPayload,
    );
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Req() req) {
    return await this.supplierService.findAll(paginationDto, req.tokenPayload);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return await this.supplierService.findOne(+id, req.tokenPayload);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @Req() req,
  ) {
    return await this.supplierService.update(
      +id,
      updateSupplierDto,
      req.tokenPayload,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return await this.supplierService.remove(+id, req.tokenPayload);
  }
}
