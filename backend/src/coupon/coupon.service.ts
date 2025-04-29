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
      return await this.couponRepo.save(coupon);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    return await this.couponRepo.find();
  }

  async findOne(id: number) {
    return await this.findCouponByCondition({ id }, 'Coupon not found !');
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findCouponByCondition(
      { id },
      'Coupon not found !',
    );
    Object.assign(coupon, updateCouponDto);
    try {
      return await this.couponRepo.save(coupon);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    const coupon = await this.findCouponByCondition(
      { id },
      'Coupon not found !',
    );
    await this.couponRepo.softRemove(coupon);
    return coupon;
  }

  private async findCouponByCondition(condition: object, errorMessage: string) {
    const coupon = await this.couponRepo.findOne({
      where: condition,
    });
    if (!coupon) {
      throw new NotFoundException(errorMessage);
    }
    return coupon;
  }
}
