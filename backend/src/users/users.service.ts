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
      id: createUserDto.branch_id,
    });

    createUserDto.password = await hash(createUserDto.password, 10);

    if (createUserDto.address) {
      const address = this.addressRepository.create(createUserDto.address);
      await this.addressRepository.save(address);
    }

    const new_user = this.userRepository.create({
      ...createUserDto,
      roles,
      branch,
    });
    console.log('User is successfully created:', new_user);
    return success(await this.userRepository.save(new_user));
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)['data'];

    Object.assign(user, updateUserDto);
    if (updateUserDto.address)
      Object.assign(user.address, updateUserDto.address);

    if (updateUserDto.address) {
      await this.addressRepository.save(updateUserDto.address);
    }

    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.delete({ id });
    console.log('User is deleted successfully.');
    return user;
  }
}
