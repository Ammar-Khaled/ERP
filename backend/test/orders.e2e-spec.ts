import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';
import { Order } from '../src/order/entities/order.entity';
import { Product } from '../src/products/entities/product.entity';
import { Category } from '../src/categories/entities/category.entity';
import { Client } from '../src/clients/entities/client.entity';
import { Status } from '../src/status/entities/status.entity';
import { TestHelper } from './test-helpers';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let orderRepository: Repository<Order>;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<Category>;
  let clientRepository: Repository<Client>;
  let statusRepository: Repository<Status>;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let authToken: string;
  let testClient: Client;
  let testStatus: Status;
  let testProduct: Product;
  let context: any;

  beforeAll(async () => {
    context = await TestHelper.setupTestContext();
    app = context.app;
    userRepository = context.userRepository;
    roleRepository = context.roleRepository;
    authToken = context.authToken;

    // Get repositories
    orderRepository = app.get<Repository<Order>>('ORDER_REPOSITORY');
    productRepository = app.get<Repository<Product>>('PRODUCT_REPOSITORY');
    categoryRepository = app.get<Repository<Category>>('CATEGORY_REPOSITORY');
    clientRepository = app.get<Repository<Client>>('CLIENT_REPOSITORY');
    statusRepository = app.get<Repository<Status>>('STATUS_REPOSITORY');

    // Create test dependencies
    testStatus = await statusRepository.save(
      statusRepository.create({
        name: 'Pending',
        nameAr: 'معلق',
        description: 'Order is pending',
      }),
    );

    testClient = await clientRepository.save(
      clientRepository.create({
        name: 'Test Client',
        nameAr: 'عميل تجريبي',
        email: 'testclient@example.com',
        phone: '+1234567890',
      }),
    );

    // Create test category and product
    const testCategory = await categoryRepository.save(
      categoryRepository.create({
        name: 'Test Category',
        nameAr: 'فئة تجريبية',
        description: 'Test category for orders',
      }),
    );

    testProduct = await productRepository.save(
      productRepository.create({
        name: 'Test Product',
        nameAr: 'منتج تجريبي',
        description: 'Test product for orders',
        sku: 'TEST-001',
        price: 100.0,
        category: testCategory,
      }),
    );
  });

  afterAll(async () => {
    if (orderRepository) await orderRepository.delete({});
    if (productRepository) await productRepository.delete({});
    if (categoryRepository) await categoryRepository.delete({});
    if (clientRepository) await clientRepository.delete({});
    if (statusRepository) await statusRepository.delete({});
    await TestHelper.cleanupTestContext(context);
  });

  describe('/orders (POST)', () => {
    it('should create a new order', () => {
      const createOrderDto = {
        clientId: testClient.id,
        orderItems: [
          {
            productId: testProduct.id,
            quantity: 2,
            unitPrice: 100.0,
          },
        ],
        totalAmount: 200.0,
        status: 'pending',
        orderDate: new Date().toISOString(),
      };

      return request(context.app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${context.authToken}`)
        .send(createOrderDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.clientId).toBe(testClient.id);
          expect(res.body.totalAmount).toBe(200.0);
          expect(res.body.status).toBe('pending');
          expect(res.body.orderItems).toHaveLength(1);
        });
    });

    it('should validate order items', () => {
      const createOrderDto = {
        clientId: testClient.id,
        orderItems: [], // Empty order items
        totalAmount: 0,
        status: 'pending',
      };

      return request(context.app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${context.authToken}`)
        .send(createOrderDto)
        .expect(400);
    });

    it('should require authentication', () => {
      const createOrderDto = {
        clientId: testClient.id,
        orderItems: [
          {
            productId: testProduct.id,
            quantity: 1,
            unitPrice: 100.0,
          },
        ],
        totalAmount: 100.0,
        status: 'pending',
      };

      return request(context.app.getHttpServer())
        .post('/orders')
        .send(createOrderDto)
        .expect(401);
    });
  });

  describe('/orders (GET)', () => {
    beforeAll(async () => {
      // Create test orders with proper Status entities
      await orderRepository.save([
        {
          client: testClient,
          totalAmount: 150.0,
          status: testStatus,
          orderDate: new Date(),
        },
        {
          client: testClient,
          totalAmount: 250.0,
          status: testStatus,
          orderDate: new Date(),
        },
      ]);
    });

    it('should get all orders with pagination', () => {
      return request(context.app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${context.authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          TestHelper.expectPaginatedResponse(res);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter orders by status', () => {
      return request(context.app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${context.authToken}`)
        .query({ status: 'pending' })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every((order) => order.status === 'pending'),
          ).toBe(true);
        });
    });

    it('should filter orders by client', () => {
      return request(context.app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${context.authToken}`)
        .query({ clientId: testClient.id })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every((order) => order.clientId === testClient.id),
          ).toBe(true);
        });
    });
  });

  describe('/orders/:id (GET)', () => {
    let testOrder: Order;

    beforeAll(async () => {
      testOrder = await orderRepository.save({
        client: testClient,
        totalAmount: 300.0,
        status: testStatus,
        orderDate: new Date(),
      });
    });

    it('should get order by id', () => {
      return request(context.app.getHttpServer())
        .get(`/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${context.authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testOrder.id);
          expect(res.body.totalAmount).toBe(300.0);
          expect(res.body.status).toBe('processing');
        });
    });

    it('should return 404 for non-existent order', () => {
      return request(context.app.getHttpServer())
        .get('/orders/99999')
        .set('Authorization', `Bearer ${context.authToken}`)
        .expect(404);
    });
  });

  describe('/orders/:id (PATCH)', () => {
    let orderToUpdate: Order;

    beforeAll(async () => {
      orderToUpdate = await orderRepository.save({
        client: testClient,
        totalAmount: 400.0,
        status: testStatus,
        orderDate: new Date(),
      });
    });

    it('should update order status', () => {
      const updateData = {
        status: 'completed',
      };

      return request(context.app.getHttpServer())
        .patch(`/orders/${orderToUpdate.id}`)
        .set('Authorization', `Bearer ${context.authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('completed');
        });
    });

    it('should require authentication', () => {
      return request(context.app.getHttpServer())
        .patch(`/orders/${orderToUpdate.id}`)
        .send({ status: 'cancelled' })
        .expect(401);
    });
  });
});
