import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Permission } from './permission.entity';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.permissionService.findOne(id);
  }

  @Post()
  create(@Body() permission: Permission) {
    return this.permissionService.create(permission);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() permission: Permission) {
    return this.permissionService.update(id, permission);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.permissionService.remove(id);
  }
}
