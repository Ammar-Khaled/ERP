import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post('create')
  create(@Body() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @Get('find-all')
  findAll() {
    return this.statusService.findAll();
  }

  @Get('find-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.statusService.findOne(+id);
  }

  @Get('find-by-name/:name')
  findOneByName(@Param('name') name: string) {
    return this.statusService.findOneByName(name);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.statusService.update(+id, updateStatusDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.statusService.remove(+id);
  }
}
