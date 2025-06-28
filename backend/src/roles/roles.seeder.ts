import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesSeeder {
  constructor(
    @Inject('ROLE_REPOSITORY')
    private roleRepository: Repository<Role>,
    @Inject('PERMISSION_REPOSITORY')
    private permissionRepository: Repository<Permission>,
  ) {}

  async seed() {
    // Create default Admin role
    const adminRoleExists = await this.roleRepository.findOne({
      where: { name: 'Admin' },
    });

    if (!adminRoleExists) {
      // Get all permissions
      const allPermissions = await this.permissionRepository.find();

      const adminRole = this.roleRepository.create({
        name: 'Admin',
        nameAr: 'مدير النظام',
        description: 'Administrator with full system access',
        descriptionAr: 'مدير النظام مع صلاحيات كاملة',
        isActive: true,
        permissions: allPermissions,
      });

      await this.roleRepository.save(adminRole);
      console.log('Admin role created with all permissions');
    }

    // Create default User role
    const readerRoleExists = await this.roleRepository.findOne({
      where: { name: 'Reader' },
    });

    if (!readerRoleExists) {
      // Get read-only permissions
      const readPermissions = await this.permissionRepository
        .createQueryBuilder('permission')
        .where('permission.name LIKE :pattern', { pattern: '%find%' })
        .getMany();

      const readerRole = this.roleRepository.create({
        name: 'Reader',
        nameAr: 'قارئ',
        description: 'Basic user with read access',
        descriptionAr: 'مستخدم أساسي مع صلاحيات قراءة محدودة',
        isActive: true,
        permissions: readPermissions,
      });

      await this.roleRepository.save(readerRole);
      console.log('Reader role created with read permissions');
    }

    console.log('Roles seeded successfully');
  }
}
