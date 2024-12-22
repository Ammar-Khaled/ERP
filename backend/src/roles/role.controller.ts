import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.roleService.findOne(id);
  }

  @Post()
  create(@Body() role: Role) {
    return this.roleService.create(role);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() role: Role) {
    return this.roleService.update(id, role);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.roleService.remove(id);
  }
}
