import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>('USER_REPOSITORY');
    roleRepository = moduleFixture.get<Repository<Role>>('ROLE_REPOSITORY');

    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    await userRepository.save({
      name: 'Test User',
      nameAr: 'مستخدم اختبار',
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      roleIds: [1],
      isActive: true,
    });
  });

  afterAll(async () => {
    await userRepository.delete({});
    await roleRepository.delete({});
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials using username', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'testuser',
          password: 'testpassword123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.username).toBe('testuser');
        });
    });

    it('should login with valid credentials using email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'test@example.com',
          password: 'testpassword123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'testuser',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'nonexistent',
          password: 'testpassword123',
        })
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(401);
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should accept valid email for password reset', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'test@example.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe(
            'Check your email for the password reset link.',
          );
        });
    });

    it('should handle non-existent email gracefully', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('User email is not found!');
        });
    });
  });
});
