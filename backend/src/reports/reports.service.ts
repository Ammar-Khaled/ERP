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

  // Get Total Orders Grouped By Day
  async getOrdersGroupedBy(
    period: 'day' | 'month',
    branchId: number,
  ): Promise<any> {
    // Use DATE_FORMAT for daily grouping or monthly grouping
    const dateGrouping =
      period === 'day'
        ? 'DATE_FORMAT(order.date, "%Y-%m-%d")' // Ensure we get the exact day
        : 'DATE_FORMAT(order.date, "%Y-%m")'; // Group by month

    const query = this.orderRepo
      .createQueryBuilder('order')
      .select(
        `${dateGrouping} AS period, SUM(order.totalPrice) AS total_sales`, // Aggregating the total sales
      )
      .where('order.branchId = :branchId', { branchId })
      .andWhere('order.date IS NOT NULL') // Ensure that we exclude null date values
      .groupBy('period')
      .orderBy('period', 'ASC'); // Ordering by the period

    const result = await query.getRawMany();
    return result;
  }
  // Get Total Purchases Grouped By Day
  async getPurchasesGroupedBy(
    period: 'day' | 'month',
    branchId: number,
  ): Promise<any> {
    const dateGrouping =
      period === 'day'
        ? 'DATE_FORMAT(purchase_request.date, "%Y-%m-%d")' // Ensure we get the exact day
        : 'DATE_FORMAT(purchase_request.date, "%Y-%m")'; // Group by month

    const query = this.purchaseRepo
      .createQueryBuilder('purchase_request')
      .select(
        `${dateGrouping} AS period, SUM(purchase_request.totalPrice) AS total_purchases`,
      )
      .where('purchase_request.branchId = :branchId', { branchId })
      .groupBy('period')
      .orderBy('period', 'ASC');

    const result = await query.getRawMany();
    return result;
  }

  // Get Top Clients (Grouped by Month) and Metric (totalAmount | count)
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
      .addSelect(`${metricColumn} as metric_value`)
      .innerJoin('order', 'order', 'order.clientId = client.id')
      .where('order.branchId = :branchId', { branchId })
      .groupBy('client.id')
      .orderBy('metric_value', 'DESC')
      .limit(5);

    const result = await query.getRawMany();
    return result;
  }

  // Get Top Suppliers (Grouped by Month)
  async getTopSuppliers(branchId: number): Promise<any> {
    const query = this.supplierRepo
      .createQueryBuilder('supplier')
      .select('supplier.id', 'supplier_id')
      .addSelect('supplier.name', 'supplier_name')
      .addSelect('SUM(purchase_requests.totalPrice) as total_purchase_amount') // Use totalPrice here
      .innerJoin(
        'purchase_requests',
        'purchase_requests',
        'purchase_requests.supplierId = supplier.id',
      )
      .where('purchase_requests.branchId = :branchId', { branchId })
      .groupBy('supplier.id')
      .orderBy('total_purchase_amount', 'DESC') // Update the alias to match the select statement
      .limit(5);

    const result = await query.getRawMany();
    return result;
  }

  // Get Monthly Revenue
  async getRevenueGroupedByMonth(branchId: number): Promise<any> {
    const query = this.orderItemRepo
      .createQueryBuilder('order_item')
      .select('DATE_FORMAT(order.date, "%Y-%m") as month') // Use order.date for grouping
      .addSelect(
        'SUM((order_item.unitPrice - product_item.cost) * order_item.numberOfItems) as revenue',
      ) // Join with product_item and use its cost column
      .innerJoin('order', 'order', 'order.id = order_item.orderId')
      .innerJoin(
        'product_item',
        'product_item',
        'product_item.id = order_item.productItemId', // Join ProductItem to get the cost
      )
      .where('order.branchId = :branchId', { branchId })
      .groupBy('month')
      .orderBy('month', 'ASC');

    const result = await query.getRawMany();
    return result;
  }

  // Get Top Products Sold (Grouped by Month) and Metric (quantity | revenue)
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
      .addSelect(`${metricColumn} as metric_value`)
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

    const result = await query.getRawMany();
    return result;
  }
}
