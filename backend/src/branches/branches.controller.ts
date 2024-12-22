import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.branchesService.findOne(id);
  }

  @Post()
  create(@Body() branch: Branch) {
    return this.branchesService.create(branch);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() branch: Branch) {
    return this.branchesService.update(id, branch);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.branchesService.remove(id);
  }
}
