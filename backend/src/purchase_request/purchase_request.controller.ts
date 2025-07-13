import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { PurchaseRequestService } from './purchase_request.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase_request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase_request.dto';
import { PdfService } from 'src/common/pdf/pdf.service';
import { Response } from 'express';
import { LoggingInterceptor } from 'src/logging/logging.interceptor';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreatePurchaseRequestOCRDto } from './dto/create-ocr_purchase_request.dto';

@Controller('purchase-requests')
export class PurchaseRequestsController {
  constructor(
    private readonly purchaseRequestService: PurchaseRequestService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('create')
  @UseInterceptors(LoggingInterceptor)
  create(
    @Body() createPurchaseRequestDto: CreatePurchaseRequestDto,
    @Req() req,
  ) {
    return this.purchaseRequestService.create(
      createPurchaseRequestDto,
      req.user,
    );
  }

  @Post('ocr-create')
  @UseInterceptors(LoggingInterceptor)
  createByOCR(
    @Body() createPurchaseRequestDto: CreatePurchaseRequestOCRDto,
    @Req() req,
  ) {
    return "OCR create endpoint is healthy!";
    
    // return this.purchaseRequestService.createByOCR(
    //   createPurchaseRequestDto,
    //   req.user,
    // );
  }

  @Patch('/cancel/:id')
  cancelRequest(@Param('id') id: string, @Req() req) {
    return this.purchaseRequestService.cancelRequest(+id, req.user.branchId);
  }

  @Patch('review/:id')
  review(
    @Param('id') id: string,
    @Headers('userId') userId: string,
    @Body('reviewNotes') reviewNotes: string,
    @Body('approved') approved: boolean,
  ) {
    return this.purchaseRequestService.review(
      +id,
      +userId,
      reviewNotes,
      approved,
    );
  }

  @Patch('add-to-inventory/:id')
  addToInventory(@Param('id') id: string, @Req() req) {
    return this.purchaseRequestService.addToInventory(+id, req.user.branchId);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @Req() req) {
    return await this.purchaseRequestService.findAll(
      paginationDto,
      req.user.branchId,
    );
  }

  @Get('find-by-id/:id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.purchaseRequestService.findOne(+id, req.user.branchId);
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
  removeRequest(@Param('id') id: string, @Req() req) {
    return this.purchaseRequestService.remove(+id, req.user.branchId);
  }

  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response, @Req() req) {
    try {
      // Fetch the purchase request
      const purchaseRequest =
        await this.purchaseRequestService.findOneWithRelations(
          +id,
          req.user.branchId,
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
