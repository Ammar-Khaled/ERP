import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('/create')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Get('/findAll')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.couponService.findAll(paginationDto);
  }

  @Get('/findOne/:id')
  findOne(@Param('id') id: number) {
    return this.couponService.findOne(+id);
  }

  @Patch('/update/:id')
  update(@Param('id') id: number, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(+id, updateCouponDto);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: number) {
    return this.couponService.remove(+id);
  }
}
