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
import { PaginatedResult, PaginationDto } from '../common/dtos/pagination.dto';

config();

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('ROLE_REPOSITORY') private roleRepository: Repository<Role>,
    @Inject('BRANCH_REPOSITORY') private branchRepository: Repository<Branch>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      relations: ['roles', 'purchaseRequests'],
      skip,
      take: limit,
    });

    users.forEach((user) => delete user.password);
    users.forEach((user) => {
      user.roleIds = user.roles.map((role) => role.id);
      delete user.roles;
      user.purchaseRequestIds = user.purchaseRequests.map(
        (purchaseRequest) => purchaseRequest.id,
      );
      delete user.purchaseRequests;
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'purchaseRequests'],
    });
    if (!user) throw new NotFoundException('User not found');

    delete user.password;

    user.roleIds = user.roles.map((role) => role.id);
    delete user.roles;

    user.purchaseRequestIds = user.purchaseRequests.map(
      (purchaseRequest) => purchaseRequest.id,
    );
    delete user.purchaseRequests;

    return user;
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

    const newUser = this.userRepository.create({
      ...createUserDto,
      roles,
      branch,
    });
    await this.userRepository.save(newUser);
    return await this.findOne(newUser.id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneByCondition({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await hash(
        updateUserDto.password,
        Number(process.env.BCRYPT_SALT_ROUNDS),
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
    }

    if (updateUserDto.address) {
      if (user.address?.id) {
        updateUserDto.address.id = user.address.id;
      }
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);
    return await this.findOne(user.id);
  }

  async remove(id: number) {
    const user = await this.findOneByCondition({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.softRemove(user);
    return await this.findOne(user.id);
  }
}
