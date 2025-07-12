import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsSeeder {
  constructor(
    @Inject('PERMISSION_REPOSITORY')
    private permissionRepository: Repository<Permission>,
  ) {}

  async seed() {
    const permissions = [
      // BranchesController permissions
      { name: 'BranchesController:findAll', description: 'Find all branches' },
      { name: 'BranchesController:findOne', description: 'Find one branch' },
      { name: 'BranchesController:create', description: 'Create branch' },
      { name: 'BranchesController:update', description: 'Update branch' },
      { name: 'BranchesController:remove', description: 'Remove branch' },
      { name: 'BranchesController:*', description: 'All branches permissions' },

      // CategoriesController permissions
      {
        name: 'CategoriesController:findAll',
        description: 'Find all categories',
      },
      {
        name: 'CategoriesController:findOne',
        description: 'Find one category',
      },
      { name: 'CategoriesController:create', description: 'Create category' },
      { name: 'CategoriesController:update', description: 'Update category' },
      { name: 'CategoriesController:remove', description: 'Remove category' },
      {
        name: 'CategoriesController:*',
        description: 'All categories permissions',
      },

      // ClientsController permissions
      { name: 'ClientsController:findAll', description: 'Find all clients' },
      { name: 'ClientsController:findOne', description: 'Find one client' },
      { name: 'ClientsController:create', description: 'Create client' },
      { name: 'ClientsController:update', description: 'Update client' },
      { name: 'ClientsController:remove', description: 'Remove client' },
      { name: 'ClientsController:*', description: 'All clients permissions' },

      // CouponsController permissions
      { name: 'CouponsController:findAll', description: 'Find all coupons' },
      { name: 'CouponsController:findOne', description: 'Find one coupon' },
      { name: 'CouponsController:create', description: 'Create coupon' },
      { name: 'CouponsController:update', description: 'Update coupon' },
      { name: 'CouponsController:remove', description: 'Remove coupon' },
      { name: 'CouponsController:*', description: 'All coupons permissions' },

      // CurrenciesController permissions
      {
        name: 'CurrenciesController:findAll',
        description: 'Find all currencies',
      },
      {
        name: 'CurrenciesController:findOne',
        description: 'Find one currency',
      },
      { name: 'CurrenciesController:create', description: 'Create currency' },
      { name: 'CurrenciesController:update', description: 'Update currency' },
      { name: 'CurrenciesController:remove', description: 'Remove currency' },
      {
        name: 'CurrenciesController:*',
        description: 'All currencies permissions',
      },

      // InventoriesController permissions
      {
        name: 'InventoriesController:findAll',
        description: 'Find all inventories',
      },
      {
        name: 'InventoriesController:findOne',
        description: 'Find one inventory',
      },
      { name: 'InventoriesController:create', description: 'Create inventory' },
      { name: 'InventoriesController:update', description: 'Update inventory' },
      { name: 'InventoriesController:remove', description: 'Remove inventory' },
      {
        name: 'InventoriesController:*',
        description: 'All inventories permissions',
      },

      // OrdersController permissions
      { name: 'OrdersController:findAll', description: 'Find all orders' },
      { name: 'OrdersController:findOne', description: 'Find one order' },
      { name: 'OrdersController:create', description: 'Create order' },
      { name: 'OrdersController:update', description: 'Update order' },
      { name: 'OrdersController:remove', description: 'Remove order' },
      {
        name: 'OrdersController:generateOrderPdf',
        description: 'Generate PDFs for orders',
      },
      {
        name: 'OrdersController:applyOrderFromInventory',
        description: 'Apply order from inventory',
      },
      {
        name: 'OrdersController:cancelOrder',
        description: 'Cancel an order',
      },
      { name: 'OrdersController:*', description: 'All orders permissions' },

      // ProductsController permissions
      { name: 'ProductsController:findAll', description: 'Find all products' },
      { name: 'ProductsController:findOne', description: 'Find one product' },
      { name: 'ProductsController:create', description: 'Create product' },
      { name: 'ProductsController:update', description: 'Update product' },
      { name: 'ProductsController:remove', description: 'Remove product' },
      {
        name: 'ProductsController:findByCategory',
        description: 'Find products by category',
      },
      { name: 'ProductsController:*', description: 'All products permissions' },

      // ProductItemsController permissions
      {
        name: 'ProductItemsController:findAll',
        description: 'Find all product items',
      },
      {
        name: 'ProductItemsController:findOne',
        description: 'Find one product item',
      },
      {
        name: 'ProductItemsController:create',
        description: 'Create product item',
      },
      {
        name: 'ProductItemsController:update',
        description: 'Update product item',
      },
      {
        name: 'ProductItemsController:remove',
        description: 'Remove product item',
      },
      {
        name: 'ProductItemsController:*',
        description: 'All product items permissions',
      },
      {
        name: 'ProductItemsController:getDamaged',
        description: 'Get damaged product items',
      },
      {
        name: 'ProductItemsController:checkExpiredProducts',
        description: 'Check expired product items',
      },
      {
        name: 'ProductItemsController:markProductsAsExpired',
        description: 'Mark products as expired',
      },
      {
        name: 'ProductItemsController:updateDamaged',
        description: 'Update damaged product items',
      },
      {
        name: 'ProductItemsController:uploadMainImage',
        description: 'Upload main image for product item',
      },
      {
        name: 'ProductItemsController:uploadImages',
        description: 'Upload images for product item',
      },
      {
        name: 'ProductItemsController:searchByName',
        description: 'Search product items by name',
      },

      // ProductItemInventoryController
      {
        name: 'ProductItemInventoryController:findAll',
        description: 'Find all product item inventories',
      },
      {
        name: 'ProductItemInventoryController:findOne',
        description: 'Find one product item inventory',
      },
      {
        name: 'ProductItemInventoryController:create',
        description: 'Create product item inventory',
      },
      {
        name: 'ProductItemInventoryController:update',
        description: 'Update product item inventory',
      },
      {
        name: 'ProductItemInventoryController:remove',
        description: 'Remove product item inventory',
      },
      {
        name: 'ProductItemInventoryController:transferProducts',
        description: 'Transfer product items between inventories',
      },
      {
        name: 'ProductItemInventoryController:*',
        description: 'All product item inventories permissions',
      },

      // PurchaseEntitiesController
      {
        name: 'PurchaseEntitiesController:findAll',
        description: 'Find all purchase entities',
      },
      {
        name: 'PurchaseEntitiesController:findOne',
        description: 'Find one purchase entity',
      },
      {
        name: 'PurchaseEntitiesController:create',
        description: 'Create purchase entity',
      },
      {
        name: 'PurchaseEntitiesController:update',
        description: 'Update purchase entity',
      },
      {
        name: 'PurchaseEntitiesController:remove',
        description: 'Remove purchase entity',
      },
      {
        name: 'PurchaseEntitiesController:findOneByName',
        description: 'Find one purchase entity by name',
      },
      {
        name: 'PurchaseEntitiesController:*',
        description: 'All purchase entities permissions',
      },

      // PurchaseRequestsController
      {
        name: 'PurchaseRequestsController:findAll',
        description: 'Find all purchase requests',
      },
      {
        name: 'PurchaseRequestsController:findOne',
        description: 'Find one purchase request',
      },
      {
        name: 'PurchaseRequestsController:create',
        description: 'Create purchase request',
      },
      {
        name: 'PurchaseRequestsController:update',
        description: 'Update purchase request',
      },
      {
        name: 'PurchaseRequestsController:removeRequest',
        description: 'Remove purchase request',
      },
      {
        name: 'PurchaseRequestsController:generatePdf',
        description: 'Generate PDFs for purchase requests',
      },
      {
        name: 'PurchaseRequestsController:review',
        description: 'Update status of purchase request',
      },
      {
        name: 'PurchaseRequestsController:cancelRequest',
        description: 'cancel a pending purchase request',
      },
      {
        name: 'PurchaseRequestsController:addToInventory',
        description: 'add an approved purchase request to inventory',
      },
      {
        name: 'PurchaseRequestsController:*',
        description: 'All purchase requests permissions',
      },

      // ReturnsController
      {
        name: 'ReturnsController:findAll',
        description: 'Find all returns',
      },
      {
        name: 'ReturnsController:findOne',
        description: 'Find one return',
      },
      { name: 'ReturnsController:create', description: 'Create return' },
      { name: 'ReturnsController:update', description: 'Update return' },
      { name: 'ReturnsController:remove', description: 'Remove return' },
      {
        name: 'ReturnsController:*',
        description: 'All returns permissions',
      },

      // RolesController permissions
      { name: 'RolesController:create', description: 'Create roles' },
      { name: 'RolesController:findAll', description: 'Find all roles' },
      { name: 'RolesController:findOneById', description: 'Find one role' },
      { name: 'RolesController:update', description: 'Update role' },
      { name: 'RolesController:remove', description: 'Remove role' },
      { name: 'RolesController:*', description: 'All roles permissions' },

      // SuppliersController
      {
        name: 'SuppliersController:findAll',
        description: 'Find all suppliers',
      },
      { name: 'SuppliersController:findOne', description: 'Find one supplier' },
      { name: 'SuppliersController:create', description: 'Create supplier' },
      { name: 'SuppliersController:update', description: 'Update supplier' },
      { name: 'SuppliersController:remove', description: 'Remove supplier' },
      {
        name: 'SuppliersController:*',
        description: 'All suppliers permissions',
      },

      // PermissionsController permissions
      {
        name: 'PermissionsController:findAll',
        description: 'Find all permissions',
      },
      {
        name: 'PermissionsController:findOne',
        description: 'Find one permission',
      },
      {
        name: 'PermissionsController:*',
        description: 'All permissions permissions',
      },

      // UsersController permissions
      { name: 'UsersController:create', description: 'Create users' },
      { name: 'UsersController:findAll', description: 'Find all users' },
      {
        name: 'UsersController:findOneById',
        description: 'Find one user by id',
      },
      { name: 'UsersController:update', description: 'Update user' },
      { name: 'UsersController:removeRequest', description: 'Remove user' },
      { name: 'UsersController:*', description: 'All users permissions' },

      // PurchaseInventoryController
      {
        name: 'PurchaseInventoryController:findAll',
        description: 'Find all purchase inventories',
      },
      {
        name: 'PurchaseInventoryController:findOne',
        description: 'Find one purchase inventory',
      },
      {
        name: 'PurchaseInventoryController:findByPurchase',
        description: 'Update purchase inventory',
      },
      {
        name: 'PurchaseInventoryController:create',
        description: 'Create purchase inventory',
      },
      {
        name: 'PurchaseInventoryController:*',
        description: 'All purchase inventories permissions',
      },

      // Units Controller
      {
        name: 'UnitsController:findAll',
        description: 'Find all units',
      },
      {
        name: 'UnitsController:findOne',
        description: 'Find one unit',
      },
      {
        name: 'UnitsController:create',
        description: 'Create unit',
      },
      {
        name: 'UnitsController:update',
        description: 'Update unit',
      },
      {
        name: 'UnitsController:remove',
        description: 'Remove unit',
      },
      {
        name: 'UnitsController:*',
        description: 'All units permissions',
      },

      // AccountTypesController
      {
        name: 'AccountTypesController:findAll',
        description: 'Find all account types',
      },
      {
        name: 'AccountTypesController:findOne',
        description: 'Find one account type',
      },
      {
        name: 'AccountTypesController:create',
        description: 'Create account type',
      },
      {
        name: 'AccountTypesController:update',
        description: 'Update account type',
      },
      {
        name: 'AccountTypesController:remove',
        description: 'Remove account type',
      },
      {
        name: 'AccountTypesController:*',
        description: 'All account types permissions',
      },

      // AccountController
      {
        name: 'AccountController:findAll',
        description: 'Find all accounts',
      },
      {
        name: 'AccountController:findOne',
        description: 'Find one account',
      },
      {
        name: 'AccountController:create',
        description: 'Create account',
      },
      {
        name: 'AccountController:update',
        description: 'Update account',
      },
      {
        name: 'AccountController:findByAccountNumber',
        description: 'Find account by account number',
      },
      {
        name: 'AccountController:*',
        description: 'All accounts permissions',
      },

      // ReportsController
      {
        name: 'ReportsController:getDailyOrders',
      },
      {
        name: 'ReportsController:getMonthlyOrders',
      },
      {
        name: 'ReportsController:getDailyPurchases',
      },
      {
        name: 'ReportsController:getMonthlyPurchases',
      },
      {
        name: 'ReportsController:getTopClients',
      },
      {
        name: 'ReportsController:getTopSuppliers',
      },
      {
        name: 'ReportsController:getMonthlyRevenue',
      },
      {
        name: 'ReportsController:getTopProducts',
      },
    ];

    console.log('Seeding permissions...');
    for (const permission of permissions) {
      const exists = await this.permissionRepository.findOne({
        where: { name: permission.name },
      });
      if (!exists) {
        await this.permissionRepository.save(permission);
      }
    }
    console.log('Permissions seeded successfully');
  }
}
