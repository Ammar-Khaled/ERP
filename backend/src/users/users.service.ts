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
import { DatabaseLoggerService } from '../logging/database-logger.service';

config();

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('ROLE_REPOSITORY') private roleRepository: Repository<Role>,
    @Inject('BRANCH_REPOSITORY') private branchRepository: Repository<Branch>,
    @Inject(DatabaseLoggerService)
    private readonly databaseLogger: DatabaseLoggerService,
  ) {}

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['roles', 'purchaseRequests'],
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

    await this.databaseLogger.log('Fetched all users', UsersService.name);

    return users;
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
