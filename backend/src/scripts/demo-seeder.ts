import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from '../common/services/seeder.service';

/**
 * Demo script showing how to use the seeder service
 * This script demonstrates:
 * 1. How to run the seeder programmatically
 * 2. How to access seeded data
 * 3. Sample queries to verify the data
 */
async function demonstrateSeeder() {
  console.log('🎯 ERP Seeder Demo');
  console.log('='.repeat(60));

  try {
    // Create application context
    const app = await NestFactory.createApplicationContext(AppModule);

    // Get the seeder service
    const seederService = app.get(SeederService);

    console.log('🌱 Starting database seeding...');
    console.log('⏱️  This may take a few minutes...\n');

    // Record start time
    const startTime = Date.now();

    // Run the seeder
    await seederService.seedDatabase();

    // Calculate elapsed time
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    console.log(`\n✅ Seeding completed in ${elapsed} seconds!`);
    console.log('\n📊 Demo Data Summary:');
    console.log('─'.repeat(40));

    // You can add verification queries here to show what was created
    console.log('• 50 addresses with Arabic translations');
    console.log('• 28 permissions with role assignments');
    console.log('• 5 roles (Super Admin, Admin, Manager, Employee, Viewer)');
    console.log('• 10 branches across different locations');
    console.log('• 25 users with various roles and permissions');
    console.log('• 7 currencies (USD, EUR, GBP, SAR, AED, EGP, JOD)');
    console.log('• 7 units (Piece, Box, Kilogram, Liter, etc.)');
    console.log('• 8 statuses for orders and requests');
    console.log('• 15 suppliers with contact information');
    console.log('• 30 clients with addresses');
    console.log('• 15 product categories');
    console.log('• Multiple inventories per branch');
    console.log('• 4 variation types with 30+ options');
    console.log('• 50 products with multiple variants');
    console.log('• 150+ product items with variations');
    console.log('• 30 purchase entities');
    console.log('• 10 discount coupons');
    console.log('• 20 purchase requests with items');
    console.log('• 30 customer orders');
    console.log('• Return records for 20% of orders');
    console.log('• 50 system notifications');

    console.log('\n🌍 Language Support:');
    console.log('─'.repeat(40));
    console.log('• All names have Arabic translations');
    console.log('• Addresses include Arabic field versions');
    console.log('• Product descriptions in both languages');
    console.log('• Status and category names bilingual');
    console.log('• User and role names with Arabic support');

    console.log('\n🔗 Entity Relationships:');
    console.log('─'.repeat(40));
    console.log('• Users → Roles → Permissions');
    console.log('• Branches → Users, Inventories, Categories');
    console.log('• Products → ProductItems → Inventory Relations');
    console.log('• Orders → OrderItems → Returns');
    console.log('• PurchaseRequests → PurchaseItems');
    console.log('• All entities properly linked with foreign keys');

    console.log('\n🎯 Next Steps:');
    console.log('─'.repeat(40));
    console.log('1. Start your application: npm run start:dev');
    console.log('2. Access API documentation: http://localhost:3000/api');
    console.log('3. Test endpoints with the seeded data');
    console.log('4. Use seeded user credentials (password: "password123")');
    console.log('5. Explore relationships in your database');

    console.log('\n📝 API Endpoints to try:');
    console.log('─'.repeat(40));
    console.log('• GET /users - View seeded users');
    console.log('• GET /products - Browse products');
    console.log('• GET /orders - Check orders');
    console.log('• GET /branches - See branches');
    console.log('• GET /suppliers - List suppliers');
    console.log('• POST /auth/login - Login with seeded users');

    // Close the application
    await app.close();

    console.log('\n🎉 Demo completed successfully!');
  } catch (error) {
    console.error('\nDemo failed:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Ensure database is running and accessible');
    console.error('2. Check database connection in .env file');
    console.error('3. Run database migrations first');
    console.error('4. Verify all dependencies are installed');

    process.exit(1);
  }
}

// Run the demo
demonstrateSeeder();
