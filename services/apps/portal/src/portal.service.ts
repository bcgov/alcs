import { Injectable } from '@nestjs/common';

@Injectable()
export class PortalService {
  getHello(): string {
    return 'Hello World!';
  }
}
