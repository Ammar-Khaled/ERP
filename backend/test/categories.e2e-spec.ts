import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';
import { Category } from '../src/categories/entities/category.entity';
import * as bcrypt from 'bcrypt';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let categoryRepository: Repository<Category>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>('USER_REPOSITORY');
    roleRepository = moduleFixture.get<Repository<Role>>('ROLE_REPOSITORY');
    categoryRepository = moduleFixture.get<Repository<Category>>(
      'CATEGORY_REPOSITORY',
    );

    // Create test role and user
    const testRole = await roleRepository.save({
      name: 'Admin',
      description: 'Test admin role',
      branchId: 1, // Add required branchId
    });

    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    await userRepository.save({
      name: 'Test Admin', // Changed from firstName/lastName to name
      username: 'testadmin',
      email: 'admin@example.com',
      password: hashedPassword,
      roleIds: [testRole.id], // Changed from role to roleIds
      branchId: 1, // Add required branchId
      isActive: true,
    });

    // Create test category
    testCategory = await categoryRepository.save({
      name: 'Test Category',
      description: 'Test category description',
      branchId: 1, // Add required branchId
    });

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        usernameOrEmail: 'testadmin',
        password: 'testpassword123',
      });

    authToken = loginResponse.body.access_token; // Fix token extraction
  });

  afterAll(async () => {
    await categoryRepository.delete({});
    await userRepository.delete({});
    await roleRepository.delete({});
    await app.close();
  });

  describe('/categories (POST)', () => {
    it('should create a new category', () => {
      const createCategoryDto = {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCategoryDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Electronics');
          expect(res.body.description).toBe(
            'Electronic devices and accessories',
          );
          expect(res.body.isActive).toBe(true);
        });
    });

    it('should reject duplicate category name', async () => {
      const createCategoryDto = {
        name: 'Electronics', // Same name as above
        description: 'Another electronics category',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createCategoryDto)
        .expect(400);
    });

    it('should require authentication', () => {
      const createCategoryDto = {
        name: 'Unauthorized Category',
        description: 'Test description',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/categories')
        .send(createCategoryDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/categories (GET)', () => {
    beforeAll(async () => {
      // Create test categories
      await categoryRepository.save([
        {
          name: 'Books',
          description: 'Books and literature',
          isActive: true,
        },
        {
          name: 'Clothing',
          description: 'Apparel and accessories',
          isActive: true,
        },
        {
          name: 'Inactive Category',
          description: 'This category is inactive',
          isActive: false,
        },
      ]);
    });

    it('should get all categories with pagination', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter active categories only', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ isActive: true })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every((category) => category.isActive === true),
          ).toBe(true);
        });
    });

    it('should search categories by name', () => {
      return request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Books' })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.some((category) => category.name.includes('Books')),
          ).toBe(true);
        });
    });
  });

  describe('/categories/:id (GET)', () => {
    let testCategory: Category;

    beforeAll(async () => {
      testCategory = await categoryRepository.save({
        name: 'Single Category',
        description: 'Single category description',
        isActive: true,
      });
    });

    it('should get category by id', () => {
      return request(app.getHttpServer())
        .get(`/categories/${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testCategory.id);
          expect(res.body.name).toBe('Single Category');
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .get('/categories/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/categories/:id (PATCH)', () => {
    let categoryToUpdate: Category;

    beforeAll(async () => {
      categoryToUpdate = await categoryRepository.save({
        name: 'Update Category',
        description: 'Update description',
        isActive: true,
      });
    });

    it('should update category', () => {
      const updateData = {
        name: 'Updated Category Name',
        description: 'Updated description',
      };

      return request(app.getHttpServer())
        .patch(`/categories/${categoryToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Category Name');
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .patch(`/categories/${categoryToUpdate.id}`)
        .send({ name: 'Unauthorized Update' })
        .expect(401);
    });
  });

  describe('/categories/:id (DELETE)', () => {
    let categoryToDelete: Category;

    beforeEach(async () => {
      categoryToDelete = await categoryRepository.save({
        name: `Delete Category ${Date.now()}`,
        description: 'Delete description',
        isActive: true,
      });
    });

    it('should delete category', () => {
      return request(app.getHttpServer())
        .delete(`/categories/${categoryToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .delete(`/categories/${categoryToDelete.id}`)
        .expect(401);
    });
  });
});
