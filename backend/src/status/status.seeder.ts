import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Status } from './entities/status.entity';

@Injectable()
export class StatusSeeder {
  constructor(
    @Inject('STATUS_REPOSITORY')
    private statusRepository: Repository<Status>,
  ) {}

  async seed() {
    console.log('Seeding statuses...');
    const statuses = [
      // Purchase request statuses
      {
        name: 'purchase_request_pending',
        nameAr: 'طلب شراء قيد الانتظار',
        description:
          'A user has created a purchase request and it is awaiting review',
        descriptionAr: 'طلب الشراء في انتظار الموافقة',
      },
      {
        name: 'purchase_request_cancelled',
        nameAr: 'طلب شراء ملغي',
        description: 'Purchase request has been cancelled',
        descriptionAr: 'تم إلغاء طلب الشراء',
      },
      {
        name: 'purchase_request_approved',
        nameAr: 'طلب شراء موافق عليه',
        description: 'Purchase request has been approved',
        descriptionAr: 'تمت الموافقة على طلب الشراء',
      },
      {
        name: 'purchase_request_rejected',
        nameAr: 'طلب شراء مرفوض',
        description: 'Purchase request has been rejected',
        descriptionAr: 'تم رفض طلب الشراء',
      },
      {
        name: 'purchase_request_completed',
        nameAr: 'طلب شراء مكتمل',
        description:
          'Purchase request has been received and added to inventory',
        descriptionAr: 'تم اكمال طلب الشراء',
      },

      // Order statuses
      {
        name: 'order_pending',
        nameAr: 'طلب بيع قيد الانتظار',
        description: 'Order is pending and awaiting processing',
        descriptionAr: 'الطلب قيد الانتظار وفي انتظار المعالجة',
      },
      {
        name: 'order_cancelled',
        nameAr: 'طلب ملغي',
        description: 'Order has been cancelled',
        descriptionAr: 'تم إلغاء الطلب',
      },
      {
        name: 'order_completed',
        nameAr: 'طلب مكتمل',
        description: 'Order has been completed and processed',
        descriptionAr: 'تم إكمال الطلب ومعالجته',
      },
    ];

    for (const statusData of statuses) {
      const existingStatus = await this.statusRepository.findOne({
        where: { name: statusData.name },
      });

      if (!existingStatus) {
        const status = this.statusRepository.create(statusData);
        await this.statusRepository.save(status);
      }
    }
    console.log('Status seeded successfully');
  }
}
