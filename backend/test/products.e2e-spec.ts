import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';
import { Product } from '../src/products/entities/product.entity';
import { Category } from '../src/categories/entities/category.entity';
import * as bcrypt from 'bcrypt';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<Category>;
  let authToken: string;
  let testCategory: Category;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>('USER_REPOSITORY');
    roleRepository = moduleFixture.get<Repository<Role>>('ROLE_REPOSITORY');
    productRepository =
      moduleFixture.get<Repository<Product>>('PRODUCT_REPOSITORY');
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
    await productRepository.delete({});
    await categoryRepository.delete({});
    await userRepository.delete({});
    await roleRepository.delete({});
    await app.close();
  });

  describe('/products (POST)', () => {
    it('should create a new product', () => {
      const createProductDto = {
        name: 'Test Product',
        description: 'Test product description',
        sku: 'TEST-001',
        categoryId: testCategory.id,
        price: 99.99,
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createProductDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Product');
          expect(res.body.sku).toBe('TEST-001');
          expect(res.body.price).toBe(99.99);
        });
    });

    it('should reject duplicate SKU', async () => {
      const createProductDto = {
        name: 'Another Product',
        description: 'Another product description',
        sku: 'TEST-001', // Same SKU as above
        categoryId: testCategory.id,
        price: 149.99,
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createProductDto)
        .expect(400);
    });

    it('should require authentication', () => {
      const createProductDto = {
        name: 'Unauthorized Product',
        description: 'Test description',
        sku: 'UNAUTH-001',
        categoryId: testCategory.id,
        price: 99.99,
      };

      return request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/products (GET)', () => {
    beforeAll(async () => {
      // Create test products
      await productRepository.save([
        {
          name: 'Product 1',
          description: 'Description 1',
          sku: 'PROD-001',
          category: testCategory,
          price: 50.0,
          isActive: true,
        },
        {
          name: 'Product 2',
          description: 'Description 2',
          sku: 'PROD-002',
          category: testCategory,
          price: 75.0,
          isActive: true,
        },
      ]);
    });

    it('should get all products with pagination', () => {
      return request(app.getHttpServer())
        .get('/products')
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

    it('should filter products by category', () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ categoryId: testCategory.id })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every(
              (product) => product.categoryId === testCategory.id,
            ),
          ).toBe(true);
        });
    });

    it('should search products by name', () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Product 1' })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.some((product) => product.name.includes('Product 1')),
          ).toBe(true);
        });
    });
  });

  describe('/products/:id (GET)', () => {
    let testProduct: Product;

    beforeAll(async () => {
      testProduct = await productRepository.save({
        name: 'Single Product',
        description: 'Single product description',
        sku: 'SINGLE-001',
        category: testCategory,
        price: 199.99,
        isActive: true,
      });
    });

    it('should get product by id', () => {
      return request(app.getHttpServer())
        .get(`/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testProduct.id);
          expect(res.body.name).toBe('Single Product');
          expect(res.body.sku).toBe('SINGLE-001');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/products/:id (PATCH)', () => {
    let productToUpdate: Product;

    beforeAll(async () => {
      productToUpdate = await productRepository.save({
        name: 'Update Product',
        description: 'Update description',
        sku: 'UPDATE-001',
        category: testCategory,
        price: 299.99,
        isActive: true,
      });
    });

    it('should update product', () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 349.99,
      };

      return request(app.getHttpServer())
        .patch(`/products/${productToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Product Name');
          expect(res.body.price).toBe(349.99);
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productToUpdate.id}`)
        .send({ name: 'Unauthorized Update' })
        .expect(401);
    });
  });

  describe('/products/:id (DELETE)', () => {
    let productToDelete: Product;

    beforeEach(async () => {
      productToDelete = await productRepository.save({
        name: 'Delete Product',
        description: 'Delete description',
        sku: `DELETE-${Date.now()}`,
        category: testCategory,
        price: 99.99,
        isActive: true,
      });
    });

    it('should delete product', () => {
      return request(app.getHttpServer())
        .delete(`/products/${productToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .delete(`/products/${productToDelete.id}`)
        .expect(401);
    });
  });
});
