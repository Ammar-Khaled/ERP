import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/auth.guard';
// import { PermissionsGuard } from '../auth/permissions.guard';
// import { AuthGuard } from '../auth/auth.guard';

// import { Permissions } from '../decorators/permissions.decorator';

@Controller('users')
// @UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  // @Permissions(['UsersController:create'])
  @Post()
  @HttpCode(201)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Permissions(['UsersController:findAll'])
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  // @Permissions(['UsersController:findOneById'])
  @Get(':id')
  async findOneById(@Param('id') id: number) {
    return await this.usersService.findOne(id);
  }

  // @Permissions(['UsersController:update'])
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // @Permissions(['UsersController:remove'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
