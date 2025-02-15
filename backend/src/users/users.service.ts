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
import { In, Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { error, success } from 'jsend';
import { Role } from '../roles/entities/role.entity';
import { Branch } from '../branches/entities/branch.entity';
import { config } from 'dotenv';
import * as process from 'node:process';

config();

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('ROLE_REPOSITORY') private roleRepository: Repository<Role>,
    @Inject('BRANCH_REPOSITORY') private branchRepository: Repository<Branch>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find();
    users.forEach((user) => delete user.password);
    return success(users);
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user)
      throw new NotFoundException(
        error({
          message: 'User not found',
          code: HttpStatus.NOT_FOUND,
          data: null,
        }),
      );
    delete user.password;
    return success(user);
  }

  async findUserByCondition(condition: object, relations?: string[]) {
    const user = await this.userRepository.findOne({
      where: condition,
      relations: relations,
    });
    if (!user)
      throw new NotFoundException(
        error({
          message: 'User not found',
          code: HttpStatus.NOT_FOUND,
          data: null,
        }),
      );
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser =
      (await this.userRepository.findOneBy({
        email: createUserDto.email,
      })) ||
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

    const roles = await this.roleRepository.findBy({
      id: In(createUserDto.roleIds || []),
    });

    const branch = await this.branchRepository.findOneBy({
      id: createUserDto.branchId || -1,
    });

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
    const response = await this.findOne(id);
    const user = response['data'];

    if (updateUserDto.password) {
      updateUserDto.password = await hash(
        updateUserDto.password,
        process.env.BYCRYPT_SALT_ROUNDS,
      );
    }

    if (updateUserDto.roleIds) {
      user.roles = await this.roleRepository.findBy({
        id: In(updateUserDto.roleIds),
      });
    }

    if (updateUserDto.branchId) {
      const branch = await this.branchRepository.findOneBy({
        id: updateUserDto.branchId,
      });
      if (!branch) {
        throw new ConflictException(
          error('Branch not found with id: ' + updateUserDto.branchId),
        );
      }
      user.branch = branch;
    } else {
      user.branch = null;
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
    const user = await this.findOne(id);
    await this.userRepository.delete({ id });
    console.log('User is deleted successfully.');
    return user;
  }
}
