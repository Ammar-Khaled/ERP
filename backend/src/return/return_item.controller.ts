import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReturnItemService } from './return_item.service';
import { CreateReturnItemDto } from './dto/create-return_item.dto';
import { UpdateReturnItemDto } from './dto/update-return_item.dto';

@Controller('return-items')
export class ReturnItemController {
  constructor(private readonly returnItemService: ReturnItemService) {}

  @Post('create')
  create(@Body() createReturnItemDto: CreateReturnItemDto) {
    return this.returnItemService.create(createReturnItemDto);
  }

  @Get('find-all')
  findAll() {
    return this.returnItemService.findAll();
  }

  @Get('find-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.returnItemService.findOne(+id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateReturnItemDto: UpdateReturnItemDto,
  ) {
    return this.returnItemService.update(+id, updateReturnItemDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.returnItemService.remove(+id);
  }
}
