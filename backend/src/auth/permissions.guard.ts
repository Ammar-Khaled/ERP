import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // If using the @Public decorator, skip permission checks
    if (this.reflector.get<boolean>('isPublic', context.getHandler())) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.roleIds || user.roleIds.length === 0) {
      throw new ForbiddenException('User has no roles assigned');
    }

    // Get user roles by their IDs
    user.roles = [];
    for (const roleId of user.roleIds) {
      if (roleId === 1) {
        // If admin role, skip permission checks
        return true;
      }
      const role = await this.roleService.findOneByCondition({ id: roleId });
      user.roles.push(role);
    }

    // Get all user permissions from their roles
    const userPermissions = user.roles
      .filter((role) => role.isActive)
      .flatMap((role) => role.permissions || [])
      .filter((permission) => permission.isActive)
      .map((permission) => permission.name);

    const handler = context.getHandler();
    const controller = context.getClass();
    const controllerName = controller.name;
    const methodName = handler.name;
    const requiredPermission = `${controllerName}:${methodName}`;

    // Check if user has any of the required permissions
    const hasPermission = this.checkPermission(
      userPermissions,
      requiredPermission,
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermission}`,
      );
    }

    return true;
  }

  private checkPermission(
    userPermissions: string[],
    requiredPermission: string,
  ): boolean {
    // Direct match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check for wildcard permissions
    for (const userPermission of userPermissions) {
      // Handle Controller:* pattern (all actions for a controller)
      if (userPermission.endsWith(':*')) {
        const controllerName = userPermission.split(':')[0];
        if (requiredPermission.startsWith(controllerName + ':')) {
          return true;
        }
      }

      // Handle Controller:find* pattern (specific action pattern)
      // if (userPermission.includes('*') && !userPermission.endsWith(':*')) {
      //   const pattern = userPermission.replace('*', '.*');
      //   const regex = new RegExp(`^${pattern}$`);
      //   if (regex.test(requiredPermission)) {
      //     return true;
      //   }
      // }
    }

    return false;
  }
}
