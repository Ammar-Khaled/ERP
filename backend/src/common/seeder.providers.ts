import { DataSource } from 'typeorm';

// Import all entities
import { Address } from './entities/address.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Unit } from '../units/entities/unit.entity';
import { Currency } from '../currency/entities/currency.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Client } from '../clients/entities/client.entity';
import { Inventory } from '../inventories/entities/inventory.entity';
import { Status } from '../status/entities/status.entity';
import { Product } from '../products/entities/product.entity';
import { Variation } from '../variation/entities/variation.entity';
import { VariationOption } from '../variation_option/entities/variation_option.entity';
import { ProductItem } from '../product_item/entities/product_item.entity';
import { ProductItemToInventory } from '../product_item_inventory/entities/product_item_inventory.entity';
import { PurchaseEntity } from '../purchase_entity/entities/purchase_entity.entity';
import { PurchaseRequest } from '../purchase_request/entities/purchase_request.entity';
import { PurchaseItem } from '../purchase_request/entities/purchase_item.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order_item.entity';
import { Return } from '../return/entities/return.entity';
import { ReturnItem } from '../return/entities/return_item.entity';
import { ReturnPurchase } from '../return_purchase/entities/return_purchase.entity';
import { ReturnPurchaseItem } from '../return_purchase/entities/return_purchase_item.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { PurchaseInventory } from '../purchase_inventory/entities/purchase_inventory.entity';

export const seederProviders = [
  {
    provide: 'ADDRESS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Address),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'BRANCH_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Branch),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ROLE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Role),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PERMISSION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Permission),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CATEGORY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Category),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'UNIT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Unit),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CURRENCY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Currency),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SUPPLIER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Supplier),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CLIENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Client),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'INVENTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Inventory),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'STATUS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Status),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Product),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'VARIATION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Variation),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'VARIATION_OPTION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(VariationOption),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductItem),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PRODUCT_ITEM_INVENTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ProductItemToInventory),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PURCHASE_ENTITY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseEntity),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PURCHASE_REQUEST_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseRequest),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PURCHASE_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseItem),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'COUPON_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Coupon),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ORDER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Order),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ORDER_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OrderItem),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'RETURN_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Return),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'RETURN_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ReturnItem),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'RETURN_PURCHASE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ReturnPurchase),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'RETURN_PURCHASE_ITEM_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ReturnPurchaseItem),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'NOTIFICATION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Notification),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PURCHASE_INVENTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(PurchaseInventory),
    inject: ['DATA_SOURCE'],
  },
];
