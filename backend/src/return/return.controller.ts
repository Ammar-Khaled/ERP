import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReturnService } from './return.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';

@Controller('return')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post('create')
  create(@Body() createReturnDto: CreateReturnDto) {
    console.log('**Controller dto \n', createReturnDto); // debug

    return this.returnService.create(createReturnDto);
  }

  @Get('find-all')
  findAll() {
    return this.returnService.findAll();
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
