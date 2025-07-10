import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Role } from '../src/roles/entities/role.entity';
import { Supplier } from '../src/suppliers/entities/supplier.entity';
import { TestHelper } from './test-helpers';

describe('Suppliers (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let supplierRepository: Repository<Supplier>;
  let authToken: string;

  beforeAll(async () => {
    const context = await TestHelper.setupTestContext();
    app = context.app;
    userRepository = context.userRepository;
    roleRepository = context.roleRepository;
    authToken = context.authToken;

    // Get supplier repository
    supplierRepository = app.get<Repository<Supplier>>('SUPPLIER_REPOSITORY');
  });

  beforeEach(async () => {
    // Clean up suppliers before each test
    if (supplierRepository) {
      await supplierRepository.delete({});
    }
  });

  afterAll(async () => {
    if (supplierRepository) {
      await supplierRepository.delete({});
    }
    if (userRepository) {
      await userRepository.delete({});
    }
    if (roleRepository) {
      await roleRepository.delete({});
    }
    await app.close();
  });

  describe('/suppliers (POST)', () => {
    it('should create a new supplier', () => {
      const createSupplierDto = {
        name: 'Test Supplier Inc.',
        email: 'contact@testsupplier.com',
        phone: '+1234567890',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSupplierDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Supplier Inc.');
          expect(res.body.contactPerson).toBe('John Smith');
          expect(res.body.email).toBe('contact@testsupplier.com');
        });
    });

    it('should reject duplicate email', async () => {
      const createSupplierDto = {
        name: 'Another Supplier',
        contactPerson: 'Jane Doe',
        email: 'contact@testsupplier.com', // Same email as above
        phone: '+0987654321',
        address: '456 Another Street',
        city: 'Another City',
        country: 'Canada',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSupplierDto)
        .expect(400);
    });

    it('should require authentication', () => {
      const createSupplierDto = {
        name: 'Unauthorized Supplier',
        contactPerson: 'Test Person',
        email: 'test@unauthorized.com',
        phone: '+1111111111',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/suppliers')
        .send(createSupplierDto)
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/suppliers (GET)', () => {
    beforeAll(async () => {
      // Create test suppliers using repository.create() to ensure proper typing
      const suppliersToSave = [
        supplierRepository.create({
          name: 'Supplier A',
          nameAr: 'مورد أ',
          email: 'suppliera@test.com',
          phone: '+1111111111',
        }),
        supplierRepository.create({
          name: 'Supplier B',
          nameAr: 'مورد ب',
          email: 'supplierb@test.com',
          phone: '+2222222222',
        }),
        supplierRepository.create({
          name: 'Inactive Supplier',
          nameAr: 'مورد غير نشط',
          email: 'inactive@test.com',
          phone: '+3333333333',
        }),
      ];
      await supplierRepository.save(suppliersToSave);
    });

    it('should get all suppliers with pagination', () => {
      return request(app.getHttpServer())
        .get('/suppliers')
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

    it('should filter active suppliers only', () => {
      return request(app.getHttpServer())
        .get('/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ isActive: true })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every((supplier) => supplier.isActive === true),
          ).toBe(true);
        });
    });

    it('should search suppliers by name', () => {
      return request(app.getHttpServer())
        .get('/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Supplier A' })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.some((supplier) =>
              supplier.name.includes('Supplier A'),
            ),
          ).toBe(true);
        });
    });
  });

  describe('/suppliers/:id (GET)', () => {
    let testSupplier: Supplier;

    beforeAll(async () => {
      testSupplier = await supplierRepository.save(
        supplierRepository.create({
          name: 'Single Supplier',
          nameAr: 'مورد واحد',
          email: 'single@test.com',
          phone: '+9999999999',
        }),
      );
    });

    it('should get supplier by id', () => {
      return request(app.getHttpServer())
        .get(`/suppliers/${testSupplier.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testSupplier.id);
          expect(res.body.name).toBe('Single Supplier');
          expect(res.body.contactPerson).toBe('Single Contact');
        });
    });

    it('should return 404 for non-existent supplier', () => {
      return request(app.getHttpServer())
        .get('/suppliers/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/suppliers/:id (PATCH)', () => {
    let supplierToUpdate: Supplier;

    beforeAll(async () => {
      supplierToUpdate = await supplierRepository.save(
        supplierRepository.create({
          name: 'Update Supplier',
          nameAr: 'مورد للتحديث',
          email: 'update@test.com',
          phone: '+8888888888',
        }),
      );
    });

    it('should update supplier', () => {
      const updateData = {
        name: 'Updated Supplier Name',
        contactPerson: 'Updated Contact Person',
        phone: '+7777777777',
      };

      return request(app.getHttpServer())
        .patch(`/suppliers/${supplierToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Supplier Name');
          expect(res.body.contactPerson).toBe('Updated Contact Person');
          expect(res.body.phone).toBe('+7777777777');
        });
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .patch(`/suppliers/${supplierToUpdate.id}`)
        .send({ name: 'Unauthorized Update' })
        .expect(401);
    });
  });

  describe('/suppliers/:id (DELETE)', () => {
    let supplierToDelete: Supplier;

    beforeEach(async () => {
      supplierToDelete = await supplierRepository.save(
        supplierRepository.create({
          name: `Delete Supplier ${Date.now()}`,
          nameAr: 'مورد للحذف',
          email: `delete${Date.now()}@test.com`,
          phone: '+6666666666',
        }),
      );
    });

    it('should delete supplier', () => {
      return request(app.getHttpServer())
        .delete(`/suppliers/${supplierToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .delete(`/suppliers/${supplierToDelete.id}`)
        .expect(401);
    });
  });
});
