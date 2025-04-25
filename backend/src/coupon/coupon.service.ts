import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import * as jsend from 'jsend';

@Injectable()
export class CouponService {
  constructor(
    @Inject('COUPON_REPOSITORY')
    private couponRepo: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    // TODO: make sure that start_date not bigger than end_date.
    const coupon = this.couponRepo.create(createCouponDto);

    try {
      const new_coupon = await this.couponRepo.save(coupon);
      return {
        statusCode: HttpStatus.OK,
        message: 'created successfully',
        status: 'success',
        data: new_coupon
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred while trying to creating the coupon !',
          status: 'error',
          data: error
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const coupons = await this.couponRepo.find();
    return {
      statusCode: HttpStatus.OK,
      message: 'Found ' + coupons.length + ' coupons',
      status: 'success',
      data: coupons
    };
  }

  async findOne(id: number) {
    const coupon = await this.findCouponByCondition(
      { id },
      'Coupon not found !',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Found',
      status: 'success',
      data: coupon
    };
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findCouponByCondition(
      { id },
      'Coupon not found !',
    );
    Object.assign(coupon, updateCouponDto);
    try{
      const updated_coupon = await this.couponRepo.save(coupon);
      return {
        statusCode: HttpStatus.OK,
        message: 'updated successfully',
        status: 'success',
        data: updated_coupon
      };
    }
    catch(error){
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred while trying to updating the coupon !',
        status: 'error',
        data: error
      },HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    const coupon = await this.findCouponByCondition(
      { id },
      'Coupon not found !',
    );
    await this.couponRepo.softRemove(coupon);
    return {
      statusCode: HttpStatus.OK,
      message: 'deleted successfully',
      status: 'success',
      data: coupon
    };
  }

  private async findCouponByCondition(condition: object, errorMessage: string) {
    const coupon = await this.couponRepo.findOne({
      where: condition,
    });
    if (!coupon) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: errorMessage,
        status: 'fail',
        data: coupon
      });
    }
    return coupon;
  }
}
