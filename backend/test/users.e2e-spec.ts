import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>('USER_REPOSITORY');
    roleRepository = moduleFixture.get<Repository<Role>>('ROLE_REPOSITORY');

    // Create authenticated test user
    const hashedPassword = await bcrypt.hash('admin', 10);
    testUser = await userRepository.save({
      name: 'admin',
      username: 'admin',
      email: 'ammar.khaled.in@example.com',
      password: hashedPassword,
      isActive: true,
    });

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        usernameOrEmail: 'admin',
        password: 'admin',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await userRepository.delete({});
    await roleRepository.delete({});
    await app.close();
  });

  describe('/users (POST)', () => {
    // it('should create a new user', () => {
    //   const createUserDto = {
    //     name: 'John Doe',
    //     username: 'johndoe',
    //     email: 'john@example.com',
    //     password: 'password123',
    //   };
    //
    //   return request(app.getHttpServer())
    //     .post('/users')
    //     .send(createUserDto)
    //     .set('Authorization', `Bearer ${authToken}`)
    //     .expect(201)
    //     .expect((res) => {
    //       expect(res.body.data).toHaveProperty('id');
    //       expect(res.body.data.name).toBe('John Doe');
    //       expect(res.body.data.username).toBe('johndoe');
    //       expect(res.body.data.email).toBe('john@example.com');
    //       expect(res.body.data).not.toHaveProperty('password');
    //     });
    // });

    it('should reject duplicate username', async () => {
      const createUserDto = {
        name: 'Jane Doe',
        username: 'johndoe', // Same username as above
        email: 'jane@example.com',
        password: 'password123',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should reject duplicate email', async () => {
      const createUserDto = {
        name: 'Jane Doe',
        username: 'janedoe',
        email: 'john@example.com', // Same email as above
        password: 'password123',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer()).post('/users').send({}).expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should get all users with pagination', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.pagination).toHaveProperty('total');
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testUser.id);
          expect(res.body.username).toBe(testUser.username);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    let userToUpdate: User;

    beforeAll(async () => {
      userToUpdate = await userRepository.save({
        name: 'Update Test',
        username: 'updatetest',
        email: 'update@example.com',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
      });
    });

    it('should update user', () => {
      const updateData = {
        name: 'Updated Name',
      };

      return request(app.getHttpServer())
        .patch(`/users/${userToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userToUpdate.id}`)
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('/users/:id (DELETE)', () => {
    let userToDelete: User;

    beforeEach(async () => {
      userToDelete = await userRepository.save({
        name: 'Delete Test',
        username: `deletetest${Date.now()}`,
        email: `delete${Date.now()}@example.com`,
        password: await bcrypt.hash('password123', 10),
        isActive: true,
      });
    });

    it('should delete user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userToDelete.id}`)
        .expect(401);
    });
  });
});
