import { Module } from '@nestjs/common';
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
import { PurchaseItemModule } from './purchase_item/purchase_item.module';
import { PurchaseRequestModule } from './purchase_request/purchase_request.module';
import { StatusModule } from './status/status.module';
import { VariationModule } from './variation/variation.module';
import { VariationOptionModule } from './variation_option/variation_option.module';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';
import { ReturnModule } from './return/return.module';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [
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
    PurchaseItemModule,
    PurchaseRequestModule,
    StatusModule,
    VariationModule,
    VariationOptionModule,
    OrderModule,
    CouponModule,
    ReturnModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
