import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  findAll(@Query('type') type?: string, @Query('archived') archived?: string) {
    return this.accountService.findAll({ type, archived });
  }

  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.accountService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.accountService.update(+id, dto);
  }

  @Get('/number/:number')
  findByAccountNumber(@Param('number') number: string) {
    return this.accountService.findByAccountNumber(number);
  }
}
