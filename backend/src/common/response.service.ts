import { Injectable } from '@nestjs/common';
import * as jsend from 'jsend'; // Import the jsend package

@Injectable()
export class ResponseService {
  success(data: any) {
    return jsend.success(data); // Use the jsend package's success method
  }

  fail(data: any) {
    return jsend.fail(data); // Provide only the data object
  }

  error(message: string) {
    return jsend.error({ message }); // Provide the message in an object
  }
}