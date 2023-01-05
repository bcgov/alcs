import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';

export type SubmissionType = {
  code: string;
  label: string;
  portalHtmlDescription: string;
};

@Injectable()
export class SubmissionTypeService {
  private logger: Logger = new Logger(SubmissionTypeService.name);

  constructor(private redisService: RedisService) {}

  async list() {
    const redisClient = await this.redisService.getClient();
    const jsonBlob = await redisClient.get('cardTypes');
    if (jsonBlob) {
      return JSON.parse(jsonBlob) as SubmissionType[];
    } else {
      this.logger.error('Failed to load submission types from Redis');
      return [];
    }
  }
}
