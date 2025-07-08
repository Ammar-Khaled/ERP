import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/auth.guard';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @HttpCode(201)
  create(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.usersService.create(createUserDto, req.user?.branchId);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Req() req) {
    return await this.usersService.findAll(paginationDto, req.user.branchId);
  }

  @Get(':id')
  async findOneById(@Param('id') id: number, @Req() req) {
    return await this.usersService.findOne(id, req.user.branchId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.usersService.remove(+id, req.user.branchId);
  }
}
