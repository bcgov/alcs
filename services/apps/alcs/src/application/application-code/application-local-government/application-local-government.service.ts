import { RedisService } from '@app/common/redis/redis.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClientType } from 'redis';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { HolidayEntity } from '../../../admin/holiday/holiday.entity';
import {
  LocalGovernmentCreateDto,
  LocalGovernmentUpdateDto,
} from '../../../admin/local-government/local-government.dto';
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
        isFirstNation: true,
      },
      where: {
        isActive: true,
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

  async update(uuid: string, updateDto: LocalGovernmentUpdateDto) {
    const localGovernment = await this.repository.findOneOrFail({
      where: {
        uuid,
      },
    });

    localGovernment.name = updateDto.name;
    localGovernment.bceidBusinessGuid = updateDto.bceidBusinessGuid;
    localGovernment.isFirstNation = updateDto.isFirstNation;
    localGovernment.isActive = updateDto.isActive;
    localGovernment.preferredRegionCode = updateDto.preferredRegionCode;

    await this.repository.save(localGovernment);
    await this.loadGovernmentsToRedis();
  }

  async create(createDto: LocalGovernmentCreateDto) {
    const newGovernment = new ApplicationLocalGovernment();
    newGovernment.name = createDto.name;
    newGovernment.bceidBusinessGuid = createDto.bceidBusinessGuid;
    newGovernment.isFirstNation = createDto.isFirstNation;
    newGovernment.isActive = createDto.isActive;
    newGovernment.preferredRegionCode = createDto.preferredRegionCode;

    await this.repository.save(newGovernment);
    await this.loadGovernmentsToRedis();
  }

  async fetch(pageIndex: number, itemsPerPage: number, search?: string) {
    let searchExpression: FindOptionsWhere<HolidayEntity> | undefined =
      undefined;

    if (search) {
      searchExpression = {
        name: Like(search),
      };
    }

    return (
      (await this.repository.findAndCount({
        where: searchExpression,
        order: { name: 'ASC' },
        take: itemsPerPage,
        skip: pageIndex * itemsPerPage,
        relations: {
          preferredRegion: true,
        },
      })) || [[], 0]
    );
  }
}
