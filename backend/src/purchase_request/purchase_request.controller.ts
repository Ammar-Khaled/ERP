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
} from '@nestjs/common';
import { PurchaseRequestService } from './purchase_request.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase_request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase_request.dto';
import { PdfService } from 'src/common/pdf/pdf.service';
import { Response } from 'express';
import { LoggingInterceptor } from 'src/logging/logging.interceptor';

@Controller('purchase-requests')
export class PurchaseRequestController {
  constructor(
    private readonly purchaseRequestService: PurchaseRequestService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('create')
  @UseInterceptors(LoggingInterceptor)
  create(@Body() createPurchaseRequestDto: CreatePurchaseRequestDto) {
    return this.purchaseRequestService.create(createPurchaseRequestDto);
  }

  @Get('find-all')
  findAll() {
    return this.purchaseRequestService.findAll();
  }

  @Get('find-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.purchaseRequestService.findOne(+id);
  }

  @Patch('update/:id')
  @UseInterceptors(LoggingInterceptor)
  update(
    @Param('id') id: string,
    @Body() updatePurchaseRequestDto: UpdatePurchaseRequestDto,
  ) {
    return this.purchaseRequestService.update(+id, updatePurchaseRequestDto);
  }

  @Delete('delete/:id')
  @UseInterceptors(LoggingInterceptor)
  remove(@Param('id') id: string) {
    return this.purchaseRequestService.remove(+id);
  }

  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      // Fetch the purchase request
      const purchaseRequest = await this.purchaseRequestService.findOne(
        +id,
        true,
      );

      // Generate the PDF
      const pdfBuffer = await this.pdfService.generatePdf(
        'purchase_request',
        purchaseRequest,
      );

      // Send the response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=purchase-request-${id}.pdf`,
      );
      res.end(pdfBuffer); // Important to use 'end' not 'send'!
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
