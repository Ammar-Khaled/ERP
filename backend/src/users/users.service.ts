import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
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
    users.forEach((user) => {
      user.roleIds = [];
      if (user.roles) {
        user.roles.forEach((role) => {
          user.roleIds.push(role.id);
        });
        delete user.roles;
      }

      if (user.address) {
        user.addressId = user.address.id;
        delete user.address;
      }
    });
    return users;
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
    if (existingUser) throw new ConflictException('User already exists');

    const roles = [];
    for (const id of createUserDto.roleIds || []) {
      const role = await this.roleRepository.findOneBy({ id });
      if (!role) {
        throw new NotFoundException('Role not found with id: ' + id);
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
          'Branch not found with id: ' + createUserDto.branchId,
        );
      }
    }

    createUserDto.password = await hash(
      createUserDto.password,
      Number(process.env.BCRYPT_SALT_ROUNDS),
    );

    console.log(createUserDto);
    const new_user = this.userRepository.create({
      ...createUserDto,
      roles,
      branch,
    });

    await this.userRepository.save(new_user);
    delete new_user.password;
    return new_user;
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
          throw new NotFoundException('Role not found with id: ' + id);
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
          'Branch not found with id: ' + updateUserDto.branchId,
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

    await this.userRepository.softRemove(user);
    return user;
  }
}
