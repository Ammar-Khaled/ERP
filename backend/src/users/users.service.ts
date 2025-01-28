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
import { Address } from '../common/entities/address.entity';
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
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
    @Inject('ROLE_REPOSITORY') private roleRepository: Repository<Role>,
    @Inject('BRANCH_REPOSITORY') private branchRepository: Repository<Branch>,
  ) {}

  async findAll() {
    return success(await this.userRepository.find());
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
    return success(user);
  }

  async findOneByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });
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
      id: createUserDto.branchId,
    });

    createUserDto.password = await hash(
      createUserDto.password,
      Number(process.env.BCRYPT_SALT_ROUNDS),
    );

    if (createUserDto.address) {
      const address = this.addressRepository.create(createUserDto.address);
      await this.addressRepository.save(address);
    }

    const new_user = this.userRepository.create({
      ...createUserDto,
      roles,
      branch,
    });
    return success(await this.userRepository.save(new_user));
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)['data'];

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

    // get the branch
    const branch = await this.branchRepository.findOneBy({
      id: updateUserDto.branchId,
    });
    if (!branch) {
      throw new ConflictException(
        error('Branch not found with id: ' + updateUserDto.branchId),
      );
    }
    user.branch = branch;

    if (updateUserDto.address) {
      const address = this.addressRepository.create(updateUserDto.address);
      await this.addressRepository.save(address);
      // Object.assign(user.address, updateUserDto.address);
    } else {
      user.address = null;
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
