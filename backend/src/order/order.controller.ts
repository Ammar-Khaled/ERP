import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Res,
  UseInterceptors,
  Headers
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PdfService } from '../common/pdf/pdf.service';
import { Response } from 'express';
import { LoggingInterceptor } from 'src/logging/logging.interceptor';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('/create')
  @UseInterceptors(LoggingInterceptor)
  create(@Body() createOrderDto: CreateOrderDto,@Headers() header: Headers) {
    return this.orderService.create(createOrderDto);
  }

  @Get('/findAll')
  findAll(@Headers('branchId') branchId: number) {
    return this.orderService.findAll(+branchId);
  }

  @Get('/findOne/:id')
  findOne(@Param('id') id: number) {
    return this.orderService.findOne(+id);
  }

  @Patch('/update/:id')
  @UseInterceptors(LoggingInterceptor)
  update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete('/delete/:id')
  @UseInterceptors(LoggingInterceptor)
  remove(@Param('id') id: number) {
    return this.orderService.remove(+id);
  }

  @Get(':id/pdf')
  async generateOrderPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      // 1. Fetch order data from your database
      const orderData = await this.orderService.findOne(+id, true);

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
