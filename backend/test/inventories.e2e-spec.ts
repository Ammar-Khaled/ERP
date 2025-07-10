import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Inventory } from '../src/inventories/entities/inventory.entity';
import { Branch } from '../src/branches/entities/branch.entity';
import { TestHelper } from './test-helpers';

describe('Inventories (e2e)', () => {
  let app: INestApplication;
  let inventoryRepository: Repository<Inventory>;
  let branchRepository: Repository<Branch>;
  let testBranch: Branch;
  let context: any;

  beforeAll(async () => {
    context = await TestHelper.setupTestContext();
    app = context.app;

    // Get repositories
    inventoryRepository = app.get<Repository<Inventory>>(
      'INVENTORY_REPOSITORY',
    );
    branchRepository = app.get<Repository<Branch>>('BRANCH_REPOSITORY');

    // Create test branch with proper entity creation
    testBranch = await branchRepository.save(
      branchRepository.create({
        name: 'Test Branch',
        nameAr: 'فرع تجريبي',
        description: 'Test branch for inventory testing',
        descriptionAr: 'فرع تجريبي لاختبار المخزون',
        phone: '+1234567890',
        isActive: true,
        // Note: email and address might be optional based on entity definition
      }),
    );
  });

  afterAll(async () => {
    await inventoryRepository.delete({});
    await branchRepository.delete({});
    await TestHelper.cleanupTestContext(context);
  });

  describe('/inventories (POST)', () => {
    it('should create a new inventory', () => {
      const createInventoryDto = {
        name: 'Main Warehouse',
        description: 'Primary inventory location',
        branchId: testBranch.id,
        address: '456 Warehouse Ave',
        isActive: true,
      };

      return request(context.app.getHttpServer())
        .post('/inventories')
        .set('Authorization', `Bearer ${context.authToken}`)
        .send(createInventoryDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Main Warehouse');
          expect(res.body.description).toBe('Primary inventory location');
          expect(res.body.branchId).toBe(testBranch.id);
        });
    });

    it('should reject duplicate inventory name in same branch', async () => {
      const createInventoryDto = {
        name: 'Main Warehouse', // Same name as above
        description: 'Another warehouse',
        branchId: testBranch.id,
        address: '789 Another Ave',
        isActive: true,
      };

      return request(context.app.getHttpServer())
        .post('/inventories')
        .set('Authorization', `Bearer ${context.authToken}`)
        .send(createInventoryDto)
        .expect(400);
    });

    it('should require authentication', () => {
      const createInventoryDto = {
        name: 'Unauthorized Inventory',
        branchId: testBranch.id,
        isActive: true,
      };

      return request(context.app.getHttpServer())
        .post('/inventories')
        .send(createInventoryDto)
        .expect(401);
    });
  });

  describe('/inventories (GET)', () => {
    beforeAll(async () => {
      // Create test inventories with simple data
      await inventoryRepository.save([
        {
          name: 'Inventory A',
          description: 'First inventory',
          branch: testBranch,
          isActive: true,
        },
        {
          name: 'Inventory B',
          description: 'Second inventory',
          branch: testBranch,
          isActive: true,
        },
        {
          name: 'Inactive Inventory',
          description: 'Inactive inventory',
          branch: testBranch,
          isActive: false,
        },
      ]);
    });

    it('should get all inventories with pagination', () => {
      return request(context.app.getHttpServer())
        .get('/inventories')
        .set('Authorization', `Bearer ${context.authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          TestHelper.expectPaginatedResponse(res);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should filter by branch', () => {
      return request(context.app.getHttpServer())
        .get('/inventories')
        .set('Authorization', `Bearer ${context.authToken}`)
        .query({ branchId: testBranch.id })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every(
              (inventory) => inventory.branchId === testBranch.id,
            ),
          ).toBe(true);
        });
    });

    it('should filter active inventories only', () => {
      return request(context.app.getHttpServer())
        .get('/inventories')
        .set('Authorization', `Bearer ${context.authToken}`)
        .query({ isActive: true })
        .expect(200)
        .expect((res) => {
          expect(
            res.body.data.every((inventory) => inventory.isActive === true),
          ).toBe(true);
        });
    });
  });

  describe('/inventories/:id (GET)', () => {
    let testInventory: Inventory;

    beforeAll(async () => {
      testInventory = await inventoryRepository.save({
        name: 'Single Inventory',
        description: 'Single inventory test',
        branch: testBranch,
        isActive: true,
      });
    });

    it('should get inventory by id', () => {
      return request(context.app.getHttpServer())
        .get(`/inventories/${testInventory.id}`)
        .set('Authorization', `Bearer ${context.authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testInventory.id);
          expect(res.body.name).toBe('Single Inventory');
        });
    });

    it('should return 404 for non-existent inventory', () => {
      return request(context.app.getHttpServer())
        .get('/inventories/99999')
        .set('Authorization', `Bearer ${context.authToken}`)
        .expect(404);
    });
  });

  describe('/inventories/:id (PATCH)', () => {
    let inventoryToUpdate: Inventory;

    beforeAll(async () => {
      inventoryToUpdate = await inventoryRepository.save({
        name: 'Update Inventory',
        description: 'Update test',
        branch: testBranch,
        isActive: true,
      });
    });

    it('should update inventory', () => {
      const updateData = {
        name: 'Updated Inventory Name',
        description: 'Updated description',
      };

      return request(context.app.getHttpServer())
        .patch(`/inventories/${inventoryToUpdate.id}`)
        .set('Authorization', `Bearer ${context.authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Inventory Name');
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('should require authentication', () => {
      return request(context.app.getHttpServer())
        .patch(`/inventories/${inventoryToUpdate.id}`)
        .send({ name: 'Unauthorized Update' })
        .expect(401);
    });
  });
});
