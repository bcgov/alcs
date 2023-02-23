import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';

export type LocalGovernment = {
  name: string;
  uuid: string;
  bceidBusinessGuid?: string;
  isFirstNation: boolean;
  isActive: boolean;
};

@Injectable()
export class LocalGovernmentService {
  private logger: Logger = new Logger(LocalGovernmentService.name);

  constructor(private redisService: RedisService) {}

  async get() {
    const redis = this.redisService.getClient();
    const jsonBlob = await redis.get('localGovernments');
    if (jsonBlob) {
      const localGovernments = JSON.parse(jsonBlob);
      return localGovernments as LocalGovernment[];
    } else {
      this.logger.error('Failed to load localGovernments from Redis');
      return [];
    }
  }

  async getByGuid(bceidBusinessGuid: string) {
    const localGovernments = await this.get();
    return localGovernments.find(
      (lg) => lg.bceidBusinessGuid === bceidBusinessGuid,
    );
  }
}
