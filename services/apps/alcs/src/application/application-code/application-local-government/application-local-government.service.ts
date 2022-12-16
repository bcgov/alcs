import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClientType } from 'redis';
import { Repository } from 'typeorm';
import { ApplicationLocalGovernment } from './application-local-government.entity';

@Injectable()
export class ApplicationLocalGovernmentService {
  private logger: Logger = new Logger(ApplicationLocalGovernmentService.name);

  constructor(
    @InjectRepository(ApplicationLocalGovernment)
    private repository: Repository<ApplicationLocalGovernment>,
    private redisService: RedisService,
  ) {
    this.loadGovernmentsToRedis();
  }

  private async loadGovernmentsToRedis() {
    const localGovernments = await this.repository.find({
      select: {
        uuid: true,
        name: true,
        bceidBusinessGuid: true,
      },
    });

    const jsonBlob = JSON.stringify(localGovernments);
    const redis = this.redisService.getClient() as RedisClientType;
    await redis.set('localGovernments', jsonBlob);
    this.logger.debug(
      `Loaded ${localGovernments.length} governments into Redis`,
    );
  }

  async list() {
    return this.repository.find({
      order: {
        name: 'ASC',
      },
      relations: {
        preferredRegion: true,
      },
    });
  }

  async getByName(name: string) {
    return this.repository.findOne({
      where: {
        name,
      },
    });
  }

  async getByUuid(uuid: string) {
    return this.repository.findOne({
      where: {
        uuid,
      },
      relations: {
        preferredRegion: true,
      },
    });
  }
}
