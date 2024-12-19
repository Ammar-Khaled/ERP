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
import { Address } from '../common/entities/address.entity';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
    @Inject('ADDRESS_REPOSITORY')
    private addressRepository: Repository<Address>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('This supplier is not found');
    return user;
  }

  async findOneByUsername(username: string): Promise<User> {
    const user = this.userRepository.findOne({ where: { username } });
    if (!user) throw new NotFoundException('This user is not found');
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    let existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) throw new ConflictException('User already exists');

    existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUser) throw new ConflictException('User already exists');

    createUserDto.password = await hash(createUserDto.password, 10);
    const new_user = this.userRepository.create(createUserDto);
    if (createUserDto.address) {
      const address = this.addressRepository.create(createUserDto.address);
      await this.addressRepository.save(address);
      new_user.address = address;
    }

    console.log('User is successfully created.');
    return await this.userRepository.save(new_user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

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
