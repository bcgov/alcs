import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { HolidayEntity } from '../admin/holiday/holiday.entity';
import {
  LocalGovernmentCreateDto,
  LocalGovernmentUpdateDto,
} from '../admin/local-government/local-government.dto';
import { LocalGovernment } from './local-government.entity';

@Injectable()
export class LocalGovernmentService {
  private logger: Logger = new Logger(LocalGovernmentService.name);

  constructor(
    @InjectRepository(LocalGovernment)
    private repository: Repository<LocalGovernment>,
  ) {}

  async list() {
    return await this.repository.find({
      order: {
        name: 'ASC',
      },
      relations: {
        preferredRegion: true,
      },
    });
  }

  async listActive() {
    return await this.repository.find({
      where: {
        isActive: true,
      },
      order: {
        name: 'ASC',
      },
      relations: {
        preferredRegion: true,
      },
    });
  }

  async getByName(name: string) {
    return await this.repository.findOne({
      where: {
        name,
      },
    });
  }

  async getByUuid(uuid: string) {
    return await this.repository.findOneOrFail({
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
    localGovernment.emails = updateDto.emails;

    await this.repository.save(localGovernment);
  }

  async create(createDto: LocalGovernmentCreateDto) {
    const newGovernment = new LocalGovernment();
    newGovernment.name = createDto.name;
    newGovernment.bceidBusinessGuid = createDto.bceidBusinessGuid;
    newGovernment.isFirstNation = createDto.isFirstNation;
    newGovernment.isActive = createDto.isActive;
    newGovernment.preferredRegionCode = createDto.preferredRegionCode;
    newGovernment.emails = createDto.emails;

    await this.repository.save(newGovernment);
  }

  async fetch(pageIndex: number, itemsPerPage: number, search?: string) {
    let searchExpression: FindOptionsWhere<HolidayEntity> | undefined =
      undefined;

    if (search) {
      searchExpression = {
        name: ILike(`%${search}%`),
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

  async getByGuid(bceidBusinessGuid: string) {
    return await this.repository.findOne({
      where: {
        bceidBusinessGuid,
      },
      relations: {
        preferredRegion: true,
      },
    });
  }
}
