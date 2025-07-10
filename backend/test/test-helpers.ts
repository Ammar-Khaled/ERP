import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

export interface TestContext {
  app: INestApplication;
  userRepository: Repository<User>;
  roleRepository: Repository<Role>;
  adminUser: User;
  adminRole: Role;
  authToken: string;
}

export class TestHelper {
  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
    return app;
  }

  static async setupTestContext(): Promise<TestContext> {
    const app = await this.createTestApp();

    const userRepository = app.get<Repository<User>>('USER_REPOSITORY');
    const roleRepository = app.get<Repository<Role>>('ROLE_REPOSITORY');

    // Create admin role
    const adminRole = await roleRepository.save({
      name: 'Admin',
      description: 'Test admin role',
      branchId: 1, // Add required branchId
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const adminUser = await userRepository.save({
      name: 'Test Admin',
      username: 'testadmin',
      email: 'admin@example.com',
      password: hashedPassword,
      roleIds: [adminRole.id],
      branchId: 1, // Add required branchId
      isActive: true,
    });

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        usernameOrEmail: 'testadmin',
        password: 'testpassword123',
      });

    const authToken = loginResponse.body.access_token;

    return {
      app,
      userRepository,
      roleRepository,
      adminUser,
      adminRole,
      authToken,
    };
  }

  static async cleanupTestContext(context: TestContext): Promise<void> {
    // Clean up all test data
    const repositories = [context.userRepository, context.roleRepository];

    for (const repo of repositories) {
      try {
        if (repo) {
          await repo.delete({});
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    if (context.app) {
      await context.app.close();
    }
  }

  static generateUniqueString(prefix = 'test'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateTestEmail(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
  }

  static expectPaginatedResponse(res: any): void {
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(Array.isArray(res.body.data)).toBe(true);
  }

  static createTestUser(
    roles: Role[],
    overrides: Partial<User> = {},
  ): Partial<User> {
    return {
      name: 'Test User',
      username: this.generateUniqueString('user'),
      email: this.generateTestEmail(),
      password: 'testpassword123',
      roleIds: roles.map((role) => role.id),
      isActive: true,
      ...overrides,
    };
  }
}
