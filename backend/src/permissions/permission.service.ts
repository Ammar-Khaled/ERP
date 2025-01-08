import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @Inject('PERMISSION_REPOSITORY')
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  findOne(id: number): Promise<Permission> {
    return this.permissionRepository.findOne({ where: { id } });
  }

  create(permission: Permission): Promise<Permission> {
    return this.permissionRepository.save(permission);
  }

  async update(id: number, permission: Permission): Promise<Permission> {
    await this.permissionRepository.update(id, permission);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
  }
}
