import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponsController } from './coupon.controller';
import { DatabaseModule } from 'src/common/database.module';
import { couponProviders } from './coupon.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CouponsController],
  providers: [CouponService, ...couponProviders],
})
export class CouponModule {}
