import { Injectable } from '@nestjs/common';
import { jsend } from 'src/common/utils/jsend.util'; // Import the custom jsend object

@Injectable()
export class ResponseService {
  success(data: any) {
    return jsend.success(data); // Use the custom success method
  }

  fail(data: any, message: string) {
    return jsend.fail(data, message); // Use the custom fail method
  }

  error(message: string) {
    return jsend.error(message); // Use the custom error method
  }
}
