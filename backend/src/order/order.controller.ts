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
  Res,
  UseInterceptors,
  Headers
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
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.orderService.findAll(paginationDto);
  }

  
  @Get('/findOne/:id')
  findOne(@Param('id') id: number,@Headers('branchId') branchId: number) {
    return this.orderService.findOne(+id,[],branchId);
  }

  @Patch('/update/:id')
  @UseInterceptors(LoggingInterceptor)
  update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete('/delete/:id')
  @UseInterceptors(LoggingInterceptor)
  remove(@Param('id') id: number, @Headers('branchId') branchId: number) {
    return this.orderService.remove(+id, branchId);
  }

  @Get(':id/pdf')
  async generateOrderPdf(@Param('id') id: number, @Res() res: Response) {
    try {
      // 1. Fetch order data from your database
      const orderData = await this.orderService.findOne(+id);

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
}
