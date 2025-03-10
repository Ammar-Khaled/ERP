import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { error, success } from 'jsend';
import { Role } from '../roles/entities/role.entity';
import { Branch } from '../branches/entities/branch.entity';
import { config } from 'dotenv';
import * as process from 'node:process';
import { Address } from '../common/entities/address.entity';

config();

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('ROLE_REPOSITORY') private roleRepository: Repository<Role>,
    @Inject('BRANCH_REPOSITORY') private branchRepository: Repository<Branch>,
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find();
    users.forEach((user) => delete user.password);
    return success(users);
  }

  async findOneByCondition(condition: object, relations?: string[]) {
    return await this.userRepository.findOne({
      where: condition,
      relations: relations,
    });
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser =
      (await this.userRepository.findOneBy({ email: createUserDto.email })) ||
      (await this.userRepository.findOneBy({
        username: createUserDto.username,
      }));
    if (existingUser)
      throw new ConflictException(
        error({
          message: 'User already exists',
          code: HttpStatus.CONFLICT,
          data: existingUser,
        }),
      );

    const roles = [];
    for (const id of createUserDto.roleIds || []) {
      const role = await this.roleRepository.findOneBy({ id });
      if (!role) {
        throw new NotFoundException(error('Role not found with id: ' + id));
      }
      roles.push(role);
    }

    let branch = null;
    if (createUserDto.branchId) {
      branch = await this.branchRepository.findOneBy({
        id: createUserDto.branchId,
      });
      if (!branch) {
        throw new NotFoundException(
          error('Branch not found with id: ' + createUserDto.branchId),
        );
      }
    }

    createUserDto.password = await hash(
      createUserDto.password,
      Number(process.env.BCRYPT_SALT_ROUNDS),
    );

    const new_user = this.userRepository.create({
      ...createUserDto,
      roles,
      branch,
    });

    await this.userRepository.save(new_user);
    delete new_user.password;
    return success(new_user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneByCondition({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await hash(
        updateUserDto.password,
        process.env.BYCRYPT_SALT_ROUNDS,
      );
    }

    if (updateUserDto.roleIds) {
      const roles = [];
      for (const id of updateUserDto.roleIds) {
        const role = await this.roleRepository.findOneBy({ id });
        if (!role) {
          throw new NotFoundException(error('Role not found with id: ' + id));
        }
        roles.push(role);
      }
      user.roles = roles;
      delete updateUserDto.roleIds;
    }

    if (updateUserDto.branchId) {
      const branch = await this.branchRepository.findOneBy({
        id: updateUserDto.branchId,
      });
      if (!branch) {
        throw new NotFoundException(
          error('Branch not found with id: ' + updateUserDto.branchId),
        );
      }
      user.branch = branch;
      delete updateUserDto.branchId;
    }

    if (updateUserDto.address) {
      if (user.address?.id) {
        updateUserDto.address.id = user.address.id;
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneByCondition({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.userRepository.softRemove(user);
    return deletedUser;
  }
}
