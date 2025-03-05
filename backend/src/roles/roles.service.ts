import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
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

  findOneByCondition(condition: object, relations?: string[]): Promise<Role> {
    return this.roleRepository.findOne({
      where: condition,
      relations: relations,
    });
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, isActive, userIds, permissionIds } =
      createRoleDto;

    // check name uniqueness
    const existingRole = await this.findOneByCondition({
      name,
    });
    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    const users = [];
    for (const id of userIds || []) {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new ConflictException(`User with id ${id} not found`);
      }
      users.push(user);
    }

    const permissions = [];
    for (const id of permissionIds || []) {
      const permission = await this.permissionRepository.findOneBy({
        id,
      });
      if (!permission) {
        throw new ConflictException(`Permission with id ${id} not found`);
      }
      permissions.push(permission);
    }

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
    const existingRole = await this.findOneByCondition({
      name: updateRoleDto.name,
    });
    if (!existingRole) {
      throw new ConflictException('Role not found');
    }

    if (updateRoleDto.userIds) {
      const users = [];
      for (const id of updateRoleDto.userIds) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
          throw new ConflictException(`User with id ${id} not found`);
        }
        users.push(user);
      }
      existingRole.users = users;
    }

    if (updateRoleDto.permissionIds) {
      const permissions = [];
      for (const id of updateRoleDto.permissionIds) {
        const permission = await this.permissionRepository.findOneBy({
          id,
        });
        if (!permission) {
          throw new ConflictException(`Permission with id ${id} not found`);
        }
        permissions.push(permission);
      }
      existingRole.permissions = permissions;
    }

    await this.roleRepository.save(existingRole);
    return existingRole;
  }

  async remove(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }
}
