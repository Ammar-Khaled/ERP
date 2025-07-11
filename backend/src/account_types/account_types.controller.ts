import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { AccountTypesService } from './account_types.service';
import { CreateAccountTypeDto } from './dto/create-account_type.dto';
import { UpdateAccountTypeDto } from './dto/update-account_type.dto';

@Controller('account-types')
export class AccountTypesController {
  constructor(private readonly accountTypesService: AccountTypesService) {}

  @Get()
  findAll() {
    return this.accountTypesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateAccountTypeDto) {
    return this.accountTypesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountTypesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountTypeDto) {
    return this.accountTypesService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountTypesService.remove(+id);
  }
}
