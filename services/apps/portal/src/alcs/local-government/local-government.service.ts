import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LocalGovernmentService {
  private logger: Logger = new Logger(LocalGovernmentService.name);

  constructor(private redisService: RedisService) {}

  async get() {
    const redis = this.redisService.getClient();
    const jsonBlob = await redis.get('localGovernments');
    if (jsonBlob) {
      const localGovernments = JSON.parse(jsonBlob);
      return localGovernments as {
        name: string;
        uuid: string;
        bceidBusinessGuid?: string;
      }[];
    } else {
      this.logger.error('Failed to load localGovernments from Redis');
      return [];
    }
  }
}
