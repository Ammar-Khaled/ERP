import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionsGuard } from '../auth/permissions.guard';
import { AuthGuard, Public } from '../auth/auth.guard';
import { Permissions } from '../decorators/permissions.decorator';

@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Permissions(['UsersController:create'])
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Permissions(['UsersController:findAll'])
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Permissions(['UsersController:findOneById'])
  @Get(':id')
  findOneById(@Param('id') id: number) {
    const user = this.usersService.findOneByCondition({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
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
