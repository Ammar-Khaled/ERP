import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Get Total Orders Grouped By Day with Branch Filter
  @Get('orders/daily')
  getDailyOrders(@Query('branchId') branchId?: number) {
    return this.reportsService.getOrdersGroupedBy('day', branchId);
  }

  // Get Total Orders Grouped By Month with Branch Filter
  @Get('orders/monthly')
  getMonthlyOrders(@Query('branchId') branchId?: number) {
    return this.reportsService.getOrdersGroupedBy('month', branchId);
  }

  // Get Total Purchases Grouped By Day with Branch Filter
  @Get('purchases/daily')
  getDailyPurchases(@Query('branchId') branchId?: number) {
    return this.reportsService.getPurchasesGroupedBy('day', branchId);
  }

  // Get Total Purchases Grouped By Month with Branch Filter
  @Get('purchases/monthly')
  getMonthlyPurchases(@Query('branchId') branchId?: number) {
    return this.reportsService.getPurchasesGroupedBy('month', branchId);
  }

  // Get Top Clients (Grouped by Month) and Metric (totalAmount | count) with Branch Filter
  @Get('top-clients')
  getTopClients(
    @Query('metric') metric: 'totalAmount' | 'count' = 'totalAmount',
    @Query('branchId') branchId?: number,
  ) {
    return this.reportsService.getTopClients(metric, branchId);
  }

  // Get Top Suppliers (Grouped by Month) with Branch Filter
  @Get('top-suppliers')
  getTopSuppliers(@Query('branchId') branchId?: number) {
    return this.reportsService.getTopSuppliers(branchId);
  }

  // Get Monthly Revenue with Branch Filter and Adjusted for Returns
  @Get('revenue/monthly')
  getMonthlyRevenue(@Query('branchId') branchId?: number) {
    return this.reportsService.getRevenueGroupedByMonth(branchId);
  }

  // Get Top Products Sold (Grouped by Month) with Branch Filter and Metric (quantity | revenue)
  @Get('top-products')
  getTopProducts(
    @Query('metric') metric: 'quantity' | 'revenue' = 'quantity',
    @Query('branchId') branchId?: number,
  ) {
    return this.reportsService.getTopSoldProducts(metric, branchId);
  }
}
