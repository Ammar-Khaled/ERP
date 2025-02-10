import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupplierModule } from './supplier/supplier.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database.module';
import { RoleModule } from './roles/role.module';
import { PermissionModule } from './permissions/permission.module';
import { BranchesModule } from './branches/branches.module';
import { InventoriesModule } from './inventories/inventories.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductItemModule } from './product_item/product_item.module';
import { ProductItemInventoryModule } from './product_item_inventory/product_item_inventory.module';
import { UnitsModule } from './units/units.module';
import { CurrencyModule } from './currency/currency.module';
import { RolesGuard } from './auth/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';
import { OrderItemModule } from './order_item/order_item.module';


@Module({
  imports: [
    DatabaseModule,
    SupplierModule,
    UsersModule,
    ClientsModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    BranchesModule,
    InventoriesModule,
    ProductsModule,
    CategoriesModule,
    ProductItemModule,
    ProductItemInventoryModule,
    UnitsModule,
    CurrencyModule,
    OrderModule,
    CouponModule,
    OrderItemModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
