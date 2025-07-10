import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment variables if not already set
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'erp_test';

// Increase timeout for all tests
jest.setTimeout(30000);

// Global test setup
beforeAll(() => {
  console.log('Starting E2E Test Suite');
});

afterAll(() => {
  console.log('E2E Test Suite Completed');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
