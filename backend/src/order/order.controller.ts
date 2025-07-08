import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PdfService } from 'src/common/pdf/pdf.service';
import { Response } from 'express';
import { LoggingInterceptor } from 'src/logging/logging.interceptor';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderService: OrderService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('/create')
  @UseInterceptors(LoggingInterceptor)
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.orderService.create(createOrderDto, req.user.branchId);
  }

  @Get('/findAll')
  async findAll(@Query() paginationDto: PaginationDto, @Req() req) {
    return await this.orderService.findAll(paginationDto, req.user.branchId);
  }

  @Get('/findOne/:id')
  findOne(@Param('id') id: number, @Req() req) {
    return this.orderService.findOne(+id, req.user.branchId);
  }

  @Patch('/update/:id')
  @UseInterceptors(LoggingInterceptor)
  update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete('/delete/:id')
  @UseInterceptors(LoggingInterceptor)
  remove(@Param('id') id: number, @Req() req) {
    return this.orderService.remove(+id, req.user.branchId);
  }

  @Get(':id/pdf')
  async generateOrderPdf(
    @Param('id') id: number,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      // 1. Fetch order data from your database
      const orderData = await this.orderService.findOne(+id, req.user.branchId);

      // 2. Generate PDF
      const pdfBuffer = await this.pdfService.generatePdf('order', orderData);

      // 3. Send response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="order-${id}.pdf"`,
      );
      res.end(pdfBuffer);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Patch('/apply-from-inventory/:id')
  @UseInterceptors(LoggingInterceptor)
  applyOrderFromInventory(@Param('id') id: number, @Req() req) {
    return this.orderService.applyOrderFromInventory(+id, req.user.branchId);
  }

  @Patch('/cancel/:id')
  @UseInterceptors(LoggingInterceptor)
  cancelOrder(@Param('id') id: number, @Req() req) {
    return this.orderService.cancelOrder(+id, req.user.branchId);
  }
}
