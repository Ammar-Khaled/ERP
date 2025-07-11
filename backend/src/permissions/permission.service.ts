import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Role } from '../roles/entities/role.entity';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsSeeder } from './permissions.seeder';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PermissionService implements OnModuleInit {
  constructor(
    @Inject('PERMISSION_REPOSITORY')
    private readonly permissionRepository: Repository<Permission>,
    @Inject('ROLE_REPOSITORY')
    private readonly roleRepository: Repository<Role>,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    private permissionsSeeder: PermissionsSeeder,
  ) {}

  async onModuleInit() {
    // await this.permissionsSeeder.seed();
    //
    // // Seed roles after permissions are created
    // const rolesSeeder = new (await import('../roles/roles.seeder')).RolesSeeder(
    //   this.roleRepository,
    //   this.permissionRepository,
    // );
    // await rolesSeeder.seed();
    // Seed the admin user after roles are created
    // await this.userRepository.save({
    //   username: 'admin',
    //   password: 'admin',
    //   email: 'ammar.khaled.in@gmail.com',
    //   name: 'admin',
    //   nameAr: 'المشرف',
    //   branchId: 1,
    //   roleIds: [1],
    // });
  }

  findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  findOne(id: number): Promise<Permission> {
    return this.permissionRepository.findOne({ where: { id } });
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // check name uniqueness
    const existingPermission = await this.permissionRepository.findOneBy({
      name: createPermissionDto.name,
    });
    if (existingPermission) {
      throw new ConflictException('Permission name already exists');
    }

    const roles = [];
    if (createPermissionDto.roleIds) {
      for (const id of createPermissionDto.roleIds) {
        const role = await this.roleRepository.findOneBy({ id });
        if (!role) {
          throw new NotFoundException(`Role with id ${id} not found`);
        }
        roles.push(role);
      }
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    permission.roles = roles;
    return this.permissionRepository.save(permission);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }

    // Handle role updates if provided
    if (updatePermissionDto.roleIds) {
      const roles = [];
      for (const roleId of updatePermissionDto.roleIds) {
        const role = await this.roleRepository.findOneBy({ id: roleId });
        if (!role) {
          throw new NotFoundException(`Role with id ${roleId} not found`);
        }
        roles.push(role);
      }
      permission.roles = roles;
    }

    // Update other fields
    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    await this.permissionRepository.delete(id);
  }
}
