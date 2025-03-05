import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { DatabaseModule } from 'src/common/database.module';
import { couponProviders } from './coupon.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CouponController],
  providers: [CouponService, ...couponProviders],
})
export class CouponModule {}
