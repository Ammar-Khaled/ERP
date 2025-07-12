import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { PurchaseRequest } from 'src/purchase_request/entities/purchase_request.entity';
import { OrderItem } from 'src/order/entities/order_item.entity';
import { ProductItem } from 'src/product_item/entities/product_item.entity';
import { Return } from 'src/return/entities/return.entity';
import { ReturnItem } from 'src/return/entities/return_item.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Supplier } from 'src/suppliers/entities/supplier.entity';

@Injectable()
export class ReportsService {
  constructor(
    @Inject('ORDER_REPOSITORY')
    private orderRepo: Repository<Order>,

    @Inject('PURCHASE_REQUEST_REPOSITORY')
    private purchaseRepo: Repository<PurchaseRequest>,

    @Inject('ORDER_ITEM_REPOSITORY')
    private orderItemRepo: Repository<OrderItem>,

    @Inject('PRODUCT_ITEM_REPOSITORY')
    private productItemRepo: Repository<ProductItem>,

    @Inject('RETURN_REPOSITORY')
    private returnRepo: Repository<Return>,

    @Inject('RETURN_ITEM_REPOSITORY')
    private returnItemRepo: Repository<ReturnItem>,

    @Inject('CLIENT_REPOSITORY')
    private clientRepo: Repository<Client>,

    @Inject('SUPPLIER_REPOSITORY')
    private supplierRepo: Repository<Supplier>,
  ) {}

  // ✅ Get Total Orders Grouped By Day or Month
  async getOrdersGroupedBy(
    period: 'day' | 'month',
    branchId: number,
  ): Promise<any> {
    const dateGrouping =
      period === 'day'
        ? `DATE_FORMAT(order.date, '%Y-%m-%d')`
        : `DATE_FORMAT(order.date, '%Y-%m')`;

    const query = this.orderRepo
      .createQueryBuilder('order')
      .select(`${dateGrouping}`, 'period')
      .addSelect('SUM(order.totalPrice)', 'total_sales')
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.date IS NOT NULL')
      .andWhere('order.deletedAt IS NULL')
      .groupBy('period')
      .orderBy('period', 'ASC');

    return await query.getRawMany();
  }

  // ✅ Get Total Purchases Grouped By Day or Month
  async getPurchasesGroupedBy(
    period: 'day' | 'month',
    branchId: number,
  ): Promise<any> {
    const dateGrouping =
      period === 'day'
        ? `DATE_FORMAT(purchase_request.date, '%Y-%m-%d')`
        : `DATE_FORMAT(purchase_request.date, '%Y-%m')`;

    const query = this.purchaseRepo
      .createQueryBuilder('purchase_request')
      .select(`${dateGrouping}`, 'period')
      .addSelect('SUM(purchase_request.totalPrice)', 'total_purchases')
      .where('purchase_request.branchId = :branchId', { branchId })
      .andWhere('purchase_request.date IS NOT NULL')
      .groupBy('period')
      .orderBy('period', 'ASC');

    return await query.getRawMany();
  }

  // ✅ Get Top Clients by Total Amount or Count
  async getTopClients(
    metric: 'totalAmount' | 'count',
    branchId: number,
  ): Promise<any> {
    const metricColumn =
      metric === 'totalAmount' ? 'SUM(order.totalPrice)' : 'COUNT(order.id)';

    const query = this.clientRepo
      .createQueryBuilder('client')
      .select('client.id', 'client_id')
      .addSelect('client.name', 'client_name')
      .addSelect(`${metricColumn}`, 'metric_value')
      .innerJoin('order', 'order', 'order.clientId = client.id')
      .where('order.branchId = :branchId', { branchId })
      .groupBy('client.id')
      .orderBy('metric_value', 'DESC')
      .limit(5);

    return await query.getRawMany();
  }

  // ✅ Get Top Suppliers by Purchase Amount
  async getTopSuppliers(branchId: number): Promise<any> {
    const query = this.supplierRepo
      .createQueryBuilder('supplier')
      .select('supplier.id', 'supplier_id')
      .addSelect('supplier.name', 'supplier_name')
      .addSelect('SUM(purchase_requests.totalPrice)', 'total_purchase_amount')
      .innerJoin(
        'purchase_requests',
        'purchase_requests',
        'purchase_requests.supplierId = supplier.id',
      )
      .where('purchase_requests.branchId = :branchId', { branchId })
      .groupBy('supplier.id')
      .orderBy('total_purchase_amount', 'DESC')
      .limit(5);

    return await query.getRawMany();
  }

  // ✅ Get Monthly Revenue
  async getRevenueGroupedByMonth(branchId: number): Promise<any> {
    const query = this.orderItemRepo
      .createQueryBuilder('order_item')
      .select(`DATE_FORMAT(order.date, '%Y-%m')`, 'period')
      .addSelect(
        'SUM((order_item.unitPrice - product_item.cost) * order_item.numberOfItems)',
        'revenue',
      )
      .innerJoin('order', 'order', 'order.id = order_item.orderId')
      .innerJoin(
        'product_item',
        'product_item',
        'product_item.id = order_item.productItemId',
      )
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.date IS NOT NULL')
      .andWhere('order.deletedAt IS NULL')
      .groupBy('period')
      .orderBy('period', 'ASC');

    return await query.getRawMany();
  }

  // ✅ Get Top Sold Products by Quantity or Revenue
  async getTopSoldProducts(
    metric: 'quantity' | 'revenue',
    branchId: number,
  ): Promise<any> {
    const metricColumn =
      metric === 'quantity'
        ? 'SUM(order_item.numberOfItems)'
        : 'SUM((order_item.unitPrice - product_item.cost) * order_item.numberOfItems)';

    const query = this.productItemRepo
      .createQueryBuilder('product_item')
      .select('product_item.id', 'product_id')
      .addSelect('product_item.name', 'product_name')
      .addSelect(`${metricColumn}`, 'metric_value')
      .innerJoin(
        'order_item',
        'order_item',
        'order_item.ProductItemId = product_item.id',
      )
      .innerJoin('order', 'order', 'order.id = order_item.orderId')
      .where('order.branchId = :branchId', { branchId })
      .groupBy('product_item.id')
      .orderBy('metric_value', 'DESC')
      .limit(5);

    return await query.getRawMany();
  }
}
