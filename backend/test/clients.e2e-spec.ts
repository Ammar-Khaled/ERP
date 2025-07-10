import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Client } from '../src/clients/entities/client.entity';
import { TestHelper } from './test-helpers';

describe('Clients (e2e)', () => {
  let app: INestApplication;
  let clientRepository: Repository<Client>;
  let context: any;

  beforeAll(async () => {
    context = await TestHelper.setupTestContext();
    app = context.app;

    // Get client repository
    clientRepository = app.get<Repository<Client>>('CLIENT_REPOSITORY');
  });

  beforeEach(async () => {
    // Clean up clients before each test
    if (clientRepository) {
      await clientRepository.delete({});
    }
  });

  afterAll(async () => {
    if (clientRepository) {
      await clientRepository.delete({});
    }
    await TestHelper.cleanupTestContext(context);
  });

  describe('/clients (POST)', () => {
    it('should create a new client', () => {
      const createClientDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main Street',
        city: 'New York',
        country: 'USA',
        isActive: true,
      };

      return request(context.app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${context.authToken}`)
        .send(createClientDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('John Doe');
          expect(res.body.email).toBe('john.doe@example.com');
          expect(res.body.phone).toBe('+1234567890');
        });
    });

    it('should reject duplicate email', async () => {
      const createClientDto = {
        name: 'Jane Smith',
        email: 'john.doe@example.com', // Same email as above
        phone: '+0987654321',
        isActive: true,
      };

      return request(context.app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${context.authToken}`)
        .send(createClientDto)
        .expect(400);
    });

    it('should require authentication', () => {
      const createClientDto = {
        name: 'Unauthorized Client',
        email: 'unauthorized@example.com',
        phone: '+1111111111',
        isActive: true,
      };

      return request(context.app.getHttpServer())
        .post('/clients')
        .send(createClientDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(context.app.getHttpServer())
        .post('/clients')
        .set('Authorization', `Bearer ${context.authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/clients (GET)', () => {
    beforeAll(async () => {
      // Create test clients
      await clientRepository.save([
        {
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+1111111111',
          isActive: true,
        },
        {
          name: 'Bob Williams',
          email: 'bob@example.com',
          phone: '+2222222222',
          isActive: true,
        },
        {
          name: 'Inactive Client',
          email: 'inactive@example.com',
          phone: '+3333333333',
          isActive: false,
        },
      ]);
    });

    it('should get all clients with pagination', () => {
      return request(context.app.getHttpServer())
        .get('/clients')
        .set('Authorization', `Bearer ${context.authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          TestHelper.expectPaginatedResponse(res);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter active clients only', () => {
      return request(context.app.getHttpServer())
        .get('/clients')
        .set('Authorization', `Bearer ${context.authToken}`)
        .query({ isActive: true })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every((client) => client.isActive === true),
          ).toBe(true);
        });
    });

    it('should search clients by name', () => {
      return request(context.app.getHttpServer())
        .get('/clients')
        .set('Authorization', `Bearer ${context.authToken}`)
        .query({ search: 'Alice' })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.some((client) => client.name.includes('Alice')),
          ).toBe(true);
        });
    });
  });

  describe('/clients/:id (GET)', () => {
    let testClient: Client;

    beforeAll(async () => {
      testClient = await clientRepository.save({
        name: 'Single Client',
        email: 'single@example.com',
        phone: '+9999999999',
        isActive: true,
      });
    });

    it('should get client by id', () => {
      return request(context.app.getHttpServer())
        .get(`/clients/${testClient.id}`)
        .set('Authorization', `Bearer ${context.authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testClient.id);
          expect(res.body.name).toBe('Single Client');
        });
    });

    it('should return 404 for non-existent client', () => {
      return request(context.app.getHttpServer())
        .get('/clients/99999')
        .set('Authorization', `Bearer ${context.authToken}`)
        .expect(404);
    });
  });

  describe('/clients/:id (PATCH)', () => {
    let clientToUpdate: Client;

    beforeAll(async () => {
      clientToUpdate = await clientRepository.save({
        name: 'Update Client',
        email: 'update@example.com',
        phone: '+8888888888',
        isActive: true,
      });
    });

    it('should update client', () => {
      const updateData = {
        name: 'Updated Client Name',
        phone: '+7777777777',
      };

      return request(context.app.getHttpServer())
        .patch(`/clients/${clientToUpdate.id}`)
        .set('Authorization', `Bearer ${context.authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Client Name');
          expect(res.body.phone).toBe('+7777777777');
        });
    });

    it('should require authentication', () => {
      return request(context.app.getHttpServer())
        .patch(`/clients/${clientToUpdate.id}`)
        .send({ name: 'Unauthorized' })
        .expect(401);
    });
  });

  describe('/clients/:id (DELETE)', () => {
    let clientToDelete: Client;

    beforeEach(async () => {
      clientToDelete = await clientRepository.save({
        name: 'Delete Client',
        email: TestHelper.generateTestEmail(),
        phone: '+6666666666',
        isActive: true,
      });
    });

    it('should delete client', () => {
      return request(context.app.getHttpServer())
        .delete(`/clients/${clientToDelete.id}`)
        .set('Authorization', `Bearer ${context.authToken}`)
        .expect(200);
    });

    it('should require authentication', () => {
      return request(context.app.getHttpServer())
        .delete(`/clients/${clientToDelete.id}`)
        .expect(401);
    });
  });
});
