import { Inject, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @Inject('ROLE_REPOSITORY')
    private readonly roleRepository: Repository<Role>,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('PERMISSION_REPOSITORY')
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  findOne(id: number): Promise<Role> {
    return this.roleRepository.findOne({ where: { id } });
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, isActive, userIds, permissionIds } =
      createRoleDto;

    const users = userIds
      ? await this.userRepository.findBy({ id: In(userIds) })
      : [];
    const permissions = permissionIds
      ? await this.permissionRepository.findBy({ id: In(permissionIds) })
      : [];

    const role = this.roleRepository.create({
      name,
      description,
      isActive,
      users,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    await this.roleRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }
}
