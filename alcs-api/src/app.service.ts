import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus(): any {

    // declare response model to handle db
    return {
      alive: true,
      db: {
        read: null,
        write: null,
      },
    };
  }
}
