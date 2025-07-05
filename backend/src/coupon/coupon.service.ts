import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class CouponService {
  constructor(
    @Inject('COUPON_REPOSITORY')
    private couponRepo: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    if (createCouponDto.endDate < createCouponDto.startDate) {
      throw new ConflictException('end date is less than start date !!');
    }

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

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.couponRepo.findAndCount({
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
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

  async checkExpiredCoupons() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredCoupons = await this.couponRepo.find({
      where: {
        endDate: LessThanOrEqual(today),
      },
    });

    if (!expiredCoupons.length) {
      return { message: 'No expired coupons found' };
    }

    const res = [];
    for (const coupon of expiredCoupons) {
      coupon.isActive = false;
      const updatedCoupon = await this.couponRepo.update(coupon.id, coupon);
      res.push(updatedCoupon);
    }

    return {
      message: `${res.length} coupons updated due to expiration`,
      details: res,
    };
  }

  findByCode(code: string) {
    return this.couponRepo.findOneBy({ code });
  }
}
