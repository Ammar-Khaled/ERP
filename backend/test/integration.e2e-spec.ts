import { TestHelper } from './test-helpers';
// Import request for the global tests
import * as request from 'supertest';

/**
 * Integration Test Suite Runner
 * This file orchestrates running all e2e tests in the correct order
 */

describe('ERP System Integration Tests', () => {
  let globalContext: any;

  beforeAll(async () => {
    console.log('🚀 Starting ERP System E2E Test Suite');
    console.log('⚙️  Setting up test environment...');

    // Setup global test context
    globalContext = await TestHelper.setupTestContext();

    console.log('✅ Test environment ready');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test environment...');

    if (globalContext) {
      await TestHelper.cleanupTestContext(globalContext);
    }

    console.log('✅ Test cleanup completed');
    console.log('🎉 ERP System E2E Test Suite Completed');
  });

  describe('Core System Tests', () => {
    it('should have a healthy application', async () => {
      const response = await request(globalContext.app.getHttpServer())
        .get('/')
        .expect(200);

      expect(response.text).toBe('Hello World!');
    });

    it('should have database connection', async () => {
      // Test database connectivity by checking if repositories are available
      expect(globalContext.userRepository).toBeDefined();
      expect(globalContext.roleRepository).toBeDefined();
    });

    it('should have authentication working', async () => {
      expect(globalContext.authToken).toBeDefined();
      expect(globalContext.authToken).toMatch(/^[\w-]*\.[\w-]*\.[\w-]*$/); // JWT format
    });
  });

  describe('API Health Checks', () => {
    const endpoints = [
      '/users',
      '/products',
      '/categories',
      '/suppliers',
      '/clients',
      '/orders',
      '/inventories',
    ];

    endpoints.forEach((endpoint) => {
      it(`should respond to ${endpoint} endpoint`, async () => {
        await request(globalContext.app.getHttpServer())
          .get(endpoint)
          .set('Authorization', `Bearer ${globalContext.authToken}`)
          .expect((res) => {
            expect([200, 404]).toContain(res.status);
          });
      });
    });
  });
});
