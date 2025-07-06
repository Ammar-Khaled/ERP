import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { DatabaseModule } from '../common/database.module';

/**
 * Utility script to clear all data from the database
 * USE WITH CAUTION - This will delete all data!
 */
async function clearDatabase() {
  console.log('⚠️  Database Clear Utility');
  console.log('='.repeat(50));
  console.log('🚨 WARNING: This will delete ALL data from your database!');

  try {
    // Create application context
    const app = await NestFactory.createApplicationContext(DatabaseModule);

    // Get data source
    const dataSource = app.get(DataSource);

    console.log('🗑️  Clearing database tables...');

    // Disable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // List of tables to clear (in dependency order)
    const tablesToClear = [
      'notifications',
      'return_items',
      'returns',
      'order_items',
      'orders',
      'return_purchase_items',
      'return_purchases',
      'purchase_items',
      'purchase_requests',
      'purchase_entity_inventory',
      'product_item_to_inventory',
      'product_item_variation_options',
      'product_items',
      'products',
      'variation_options',
      'variations',
      'categories',
      'inventories',
      'purchase_entities',
      'coupons',
      'statuses',
      'clients',
      'suppliers',
      'currencies',
      'units',
      'users_roles',
      'role_permissions',
      'users',
      'roles',
      'permissions',
      'branches',
      'addresses',
    ];

    // Clear each table
    for (const table of tablesToClear) {
      try {
        await dataSource.query(`DELETE FROM ${table}`);
        console.log(`✅ Cleared table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} not found or already empty`);
      }
    }

    // Reset auto-increment values
    for (const table of tablesToClear) {
      try {
        await dataSource.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
      } catch (error) {
        // Ignore errors for tables that don't exist or don't have auto-increment
      }
    }

    // Re-enable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✅ Database cleared successfully!');
    console.log('📝 All tables are now empty and ready for fresh data.');

    // Close the application
    await app.close();
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
}

// Check for confirmation argument
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  clearDatabase();
} else {
  console.log('⚠️  To confirm database clearing, run:');
  console.log('npm run db:clear -- --confirm');
  console.log('\n🚨 This action cannot be undone!');
}
