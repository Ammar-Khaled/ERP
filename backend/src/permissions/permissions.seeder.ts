import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsSeeder {
  constructor(
    @Inject('PERMISSION_REPOSITORY')
    private permissionRepository: Repository<Permission>,
  ) {}

  async seed() {
    const permissions = [
      // UsersController permissions
      { name: 'UsersController:create', description: 'Create users' },
      { name: 'UsersController:findAll', description: 'Find all users' },
      {
        name: 'UsersController:findOneById',
        description: 'Find one user by id',
      },
      { name: 'UsersController:update', description: 'Update user' },
      { name: 'UsersController:removeRequest', description: 'Remove user' },
      { name: 'UsersController:*', description: 'All users permissions' },
      { name: 'UsersController:find*', description: 'Find users' },
    ];

    for (const permission of permissions) {
      const exists = await this.permissionRepository.findOne({
        where: { name: permission.name },
      });
      if (!exists) {
        await this.permissionRepository.save(permission);
      }
    }
  }
}
