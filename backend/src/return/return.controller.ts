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
import { ReturnService } from './return.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('return')
export class ReturnsController {
  constructor(private readonly returnService: ReturnService) {}

  @Post('create')
  create(@Body() createReturnDto: CreateReturnDto) {
    console.log('**Controller dto \n', createReturnDto); // debug

    return this.returnService.create(createReturnDto);
  }

  @Get('find-all')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.returnService.findAll(paginationDto);
  }

  @Get('find-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.returnService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateReturnDto: UpdateReturnDto) {
    return this.returnService.update(+id, updateReturnDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.returnService.remove(+id);
  }
}
