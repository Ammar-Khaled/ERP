import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.branchesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.branchesService.findOne(id);
  }

  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() branch: Branch) {
    return this.branchesService.update(id, branch);
  }

  // @Delete(':id')
  // remove(@Param('id') id: number) {
  //   return this.branchesService.remove(id);
  // }
}
