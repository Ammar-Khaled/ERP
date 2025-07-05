import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CouponService } from '../coupon.service';

@Injectable()
export class ExpiredCouponsScheduler {
  private readonly logger = new Logger(ExpiredCouponsScheduler.name);

  constructor(private readonly couponService: CouponService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiryCheck() {
    this.logger.log('Running daily check for expired products');
    try {
      const result = await this.couponService.checkExpiredCoupons();
      this.logger.log(`Expiry check completed: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(
        `Error checking expired coupons: ${error.message}`,
        error.stack,
      );
    }
  }
}
