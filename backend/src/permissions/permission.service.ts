import {
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Role } from '../roles/entities/role.entity';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsSeeder } from './permissions.seeder';

@Injectable()
export class PermissionService implements OnModuleInit {
  constructor(
    @Inject('PERMISSION_REPOSITORY')
    private readonly permissionRepository: Repository<Permission>,
    @Inject('ROLE_REPOSITORY')
    private readonly roleRepository: Repository<Role>,
    private permissionsSeeder: PermissionsSeeder,
  ) {}

  async onModuleInit() {
    await this.permissionsSeeder.seed();
    console.log('Permissions seeded successfully');
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
          throw new Error(`Role with id ${id} not found`);
        }
        roles.push(role);
      }
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    permission.roles = roles;
    return this.permissionRepository.save(createPermissionDto);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    await this.permissionRepository.update(id, updatePermissionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
  }
}
