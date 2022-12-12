import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';

export type PortalApplicationType = {
  code: string;
  portalLabel: string;
  htmlDescription: string;
  label: string;
};

@Injectable()
export class ApplicationTypeService {
  private logger: Logger = new Logger(ApplicationTypeService.name);

  constructor(private redisService: RedisService) {}

  async list() {
    const redisClient = await this.redisService.getClient();
    const jsonBlob = await redisClient.get('applicationTypes');
    if (jsonBlob) {
      return JSON.parse(jsonBlob) as PortalApplicationType[];
    } else {
      this.logger.error('Failed to load application types from Redis');
      return [];
    }
  }

  async get(typeCode: string) {
    const list = await this.list();
    const type = list.find((type) => type.code === typeCode);
    if (type) {
      return type.portalLabel;
    } else {
      this.logger.error(`Failed to find matching type for code ${typeCode}`);
      return '';
    }
  }
}
