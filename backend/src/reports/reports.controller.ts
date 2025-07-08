import { Controller, Get, Query, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Get Total Orders Grouped By Day with Branch Filter
  @Get('orders/daily')
  getDailyOrders(@Request() req: any) {
    return this.reportsService.getOrdersGroupedBy('day', req.user.branchId);
  }

  // Get Total Orders Grouped By Month with Branch Filter
  @Get('orders/monthly')
  getMonthlyOrders(@Request() req: any) {
    return this.reportsService.getOrdersGroupedBy('month', req.user.branchId);
  }

  // Get Total Purchases Grouped By Day with Branch Filter
  @Get('purchases/daily')
  getDailyPurchases(@Request() req: any) {
    return this.reportsService.getPurchasesGroupedBy('day', req.user.branchId);
  }

  // Get Total Purchases Grouped By Month with Branch Filter
  @Get('purchases/monthly')
  getMonthlyPurchases(@Request() req: any) {
    return this.reportsService.getPurchasesGroupedBy(
      'month',
      req.user.branchId,
    );
  }

  // Get Top Clients (Grouped by Month) and Metric (totalAmount | count) with Branch Filter
  @Get('top-clients')
  getTopClients(
    @Query('metric') metric: 'totalAmount' | 'count' = 'totalAmount',
    @Request() req: any,
  ) {
    return this.reportsService.getTopClients(metric, req.user.branchId);
  }

  // Get Top Suppliers (Grouped by Month) with Branch Filter
  @Get('top-suppliers')
  getTopSuppliers(@Request() req: any) {
    return this.reportsService.getTopSuppliers(req.user.branchId);
  }

  // Get Monthly Revenue with Branch Filter and Adjusted for Returns
  @Get('revenue/monthly')
  getMonthlyRevenue(@Request() req: any) {
    return this.reportsService.getRevenueGroupedByMonth(req.user.branchId);
  }

  // Get Top Products Sold (Grouped by Month) with Branch Filter and Metric (quantity | revenue)
  @Get('top-products')
  getTopProducts(
    @Query('metric') metric: 'quantity' | 'revenue' = 'quantity',
    @Request() req: any,
  ) {
    return this.reportsService.getTopSoldProducts(metric, req.user.branchId);
  }
}
