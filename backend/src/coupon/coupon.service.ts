import { Inject, Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import * as jsend from 'jsend';

@Injectable()
export class CouponService {
  constructor(
    @Inject("COUPON_REPOSITORY")
    private couponRepo: Repository<Coupon>,
  ){}


  async create(createCouponDto: CreateCouponDto) {
    // TODO: make sure that start_date not bigger than end_date.
    const coupon = this.couponRepo.create(createCouponDto);

    try{
      const new_order = await this.couponRepo.save(coupon);
      return jsend.success(new_order);
    }
    catch(error){
      throw new HttpException(
        jsend.error({message: 'An unexpected error occurred while trying to save the coupon. Please, try again later.',data: error}),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll() {
    const coupons = await this.couponRepo.find();
    return jsend.success(coupons);
  }

  async findOne(id: number) {
    const coupon = await this.findCouponByCondition({id},'Coupon not found !');
    return jsend.success(coupon);
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findCouponByCondition({id}, 'Coupon not found !');
    Object.assign(coupon, updateCouponDto);
    const updated_coupon = await this.couponRepo.save(coupon);
    return jsend.success(updated_coupon);
  }

  async remove(id: number) {
    const coupon = await this.findCouponByCondition({id},'Coupon not found !');
    await this.couponRepo.delete({id});
    return jsend.success(coupon);
  }

  private async findCouponByCondition(condition: object,errorMessage: string){
    const coupon = await this.couponRepo.findOne({
      where: condition
    });
    if(!coupon){
      throw new NotFoundException(jsend.fail({message: errorMessage}));
    }
    return coupon;
  }
}
