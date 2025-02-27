import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('supplier')
// #todo: add Guards ... Waiting for Auth and Roles modules!
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await this.supplierService.create(createSupplierDto);
  }

  @Get('/all')
  async findAll() {
    return await this.supplierService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.supplierService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return await this.supplierService.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.supplierService.remove(+id);
  }
}
