import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuppliersModule } from './suppliers/suppliers.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './common/database.module';
import { RolesModule } from './roles/roles.module';
import { PermissionModule } from './permissions/permission.module';
import { BranchesModule } from './branches/branches.module';
import { InventoriesModule } from './inventories/inventories.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductItemModule } from './product_item/product_item.module';
import { ProductItemInventoryModule } from './product_item_inventory/product_item_inventory.module';
import { UnitsModule } from './units/units.module';
import { CurrencyModule } from './currency/currency.module';
import { PurchaseEntityModule } from './purchase_entity/purchase_entity.module';
import { PurchaseRequestModule } from './purchase_request/purchase_request.module';
import { StatusModule } from './status/status.module';
import { VariationModule } from './variation/variation.module';
import { VariationOptionModule } from './variation_option/variation_option.module';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';
import { ReturnModule } from './return/return.module';
import { LoggingModule } from './logging/logging.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';
import { ReturnPurchaseModule } from './return_purchase/return_purchase.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    SuppliersModule,
    UsersModule,
    ClientsModule,
    AuthModule,
    RolesModule,
    PermissionModule,
    BranchesModule,
    InventoriesModule,
    ProductsModule,
    CategoriesModule,
    ProductItemModule,
    ProductItemInventoryModule,
    UnitsModule,
    CurrencyModule,
    PurchaseEntityModule,
    PurchaseRequestModule,
    StatusModule,
    VariationModule,
    VariationOptionModule,
    OrderModule,
    CouponModule,
    ReturnModule,
    LoggingModule,
    LoggingModule,
    NotificationsModule,
    ReturnPurchaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
