import { Module } from '@nestjs/common';
import { ResponseService } from './response.service';

@Module({
  providers: [ResponseService],
  exports: [ResponseService],  // Ensure it's exported
})
export class CommonModule {}